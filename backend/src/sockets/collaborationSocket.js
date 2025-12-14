import { getPresence, joinPresence, leavePresence, updateCursor, applyEdit, saveDraft, getBlogSnapshot } from '../services/collaborationService.js';
import MergeConflict from '../models/MergeConflict.js';

const recentParagraphEdits = new Map();

export function initCollaborationSocket(io) {
  io.on('connection', (socket) => {
    socket.on('joinSession', async ({ blogId, userId, cursor }) => {
      if (!blogId || !userId) return socket.emit('error', { message: 'Missing blogId or userId' });
      socket.join(`blog:${blogId}`);
      joinPresence(blogId, userId, cursor || null);
      io.to(`blog:${blogId}`).emit('presenceUpdate', getPresence(blogId));
      try {
        const snapshot = await getBlogSnapshot(blogId);
        if (snapshot) {
          socket.emit('contentSnapshot', snapshot);
        }
      } catch (err) {
        // ignore snapshot errors for now
      }
    });

    socket.on('paragraphEdit', async ({ blogId, userId, segmentId, text }) => {
      try {
        if (!blogId || !userId || !segmentId || typeof text !== 'string') return;

        const key = String(blogId);
        if (!recentParagraphEdits.has(key)) {
          recentParagraphEdits.set(key, new Map());
        }
        const blogMap = recentParagraphEdits.get(key);

        const now = Date.now();
        const windowMs = 60000;
        const prev = blogMap.get(segmentId);

        // Debug: show incoming paragraph edits
        // eslint-disable-next-line no-console
        console.log('[collab] paragraphEdit', { blogId, userId, segmentId, hasPrev: !!prev });

        if (
          prev &&
          now - prev.ts <= windowMs
        ) {
          await MergeConflict.create({
            blog: blogId,
            segmentId,
            versionA: { text: prev.text },
            versionB: { text },
            status: 'pending_ai',
          });
          // eslint-disable-next-line no-console
          console.log('[collab] merge conflict created', { blogId, segmentId });
          blogMap.delete(segmentId);
        } else {
          blogMap.set(segmentId, { userId, text, ts: now });
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[collab] paragraphEdit error', err);
      }
    });

    socket.on('cursorUpdate', ({ blogId, userId, cursor }) => {
      if (!blogId || !userId) return;
      updateCursor(blogId, userId, cursor);
      io.to(`blog:${blogId}`).emit('presenceUpdate', getPresence(blogId));
    });

    socket.on('editContent', async ({ blogId, userId, delta }) => {
      try {
        if (!blogId || !userId) return;
        await applyEdit(blogId, userId, delta);
        socket.to(`blog:${blogId}`).emit('editContent', { blogId, userId, delta });
      } catch (err) {
        socket.emit('error', { message: 'Failed to apply edit' });
      }
    });

    socket.on('saveDraft', async ({ blogId, userId, content }) => {
      try {
        if (!blogId || !userId) return;
        const blog = await saveDraft(blogId, userId, content);
        io.to(`blog:${blogId}`).emit('saved', { blogId: blog._id, updatedAt: blog.updatedAt });
      } catch (err) {
        socket.emit('error', { message: 'Failed to save draft' });
      }
    });

    socket.on('leaveSession', ({ blogId, userId }) => {
      if (!blogId || !userId) return;
      socket.leave(`blog:${blogId}`);
      leavePresence(blogId, userId);
      io.to(`blog:${blogId}`).emit('presenceUpdate', getPresence(blogId));
    });
  });
}
