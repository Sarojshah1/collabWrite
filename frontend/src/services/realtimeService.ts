import type { Socket } from 'socket.io-client';

export type CollabClient = {
  socket: Socket;
  join: (blogId: string, userId: string, cursor?: any) => void;
  leave: (blogId: string, userId: string) => void;
  updateCursor: (blogId: string, userId: string, cursor: any) => void;
  saveDraft: (blogId: string, userId: string, content: { contentHTML?: string }) => void;
  onPresence: (cb: (presence: any) => void) => void;
  onSaved: (cb: (info: { blogId: string; updatedAt: string | number }) => void) => void;
  editContent: (blogId: string, userId: string, delta: any) => void;
  onEdit: (cb: (data: { blogId: string; userId: string; delta: any }) => void) => void;
  onSnapshot: (cb: (data: { blogId: string; contentHTML?: string }) => void) => void;
  paragraphEdit: (blogId: string, userId: string, segmentId: string, text: string) => void;
  disconnect: () => void;
};

export function getBackendBase() {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  // Default dev backend
  return 'http://localhost:4000';
}

export async function connectCollab(): Promise<CollabClient> {
  const base = getBackendBase();
  // Lazy import to avoid SSR issues
  const { io } = await import('socket.io-client');
  const socket = io(base, { withCredentials: true, transports: ['websocket'] });
  if (typeof window !== 'undefined') {
    // Basic debug logging for realtime connection lifecycle
    console.log('[collab] connecting to', base);
    socket.on('connect', () => {
      console.log('[collab] socket connected', socket.id);
    });
    socket.on('disconnect', (reason) => {
      console.log('[collab] socket disconnected', reason);
    });
    socket.on('connect_error', (err) => {
      console.error('[collab] connect_error', err?.message || err);
    });
  }

  const api: CollabClient = {
    socket,
    join: (blogId, userId, cursor) => socket.emit('joinSession', { blogId, userId, cursor }),
    leave: (blogId, userId) => socket.emit('leaveSession', { blogId, userId }),
    updateCursor: (blogId, userId, cursor) => socket.emit('cursorUpdate', { blogId, userId, cursor }),
    saveDraft: (blogId, userId, content) => socket.emit('saveDraft', { blogId, userId, content }),
    onPresence: (cb) => { socket.on('presenceUpdate', cb); },
    onSaved: (cb) => { socket.on('saved', cb as any); },
    editContent: (blogId, userId, delta) => socket.emit('editContent', { blogId, userId, delta }),
    onEdit: (cb) => {
      socket.on('editContent', (payload: any) => cb(payload));
    },
    onSnapshot: (cb) => {
      socket.on('contentSnapshot', (payload: any) => cb(payload));
    },
    paragraphEdit: (blogId, userId, segmentId, text) =>
      socket.emit('paragraphEdit', { blogId, userId, segmentId, text }),
    disconnect: () => socket.disconnect(),
  };

  return api;
}

export function getUserIdFromToken(): string | null {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1] || ''));
    return payload?.id || payload?._id || null;
  } catch {
    return null;
  }
}
