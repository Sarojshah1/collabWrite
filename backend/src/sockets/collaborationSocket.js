import { getPresence, joinPresence, leavePresence, updateCursor, applyEdit, saveDraft } from '../services/collaborationService.js';

export function initCollaborationSocket(io) {
  io.on('connection', (socket) => {
    socket.on('joinSession', ({ blogId, userId, cursor }) => {
      if (!blogId || !userId) return socket.emit('error', { message: 'Missing blogId or userId' });
      socket.join(`blog:${blogId}`);
      joinPresence(blogId, userId, cursor || null);
      io.to(`blog:${blogId}`).emit('presenceUpdate', getPresence(blogId));
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
        socket.to(`blog:${blogId}`).emit('editContent', { userId, delta });
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
