import type { Socket } from 'socket.io-client';

export type CollabClient = {
  socket: Socket;
  join: (blogId: string, userId: string, cursor?: any) => void;
  leave: (blogId: string, userId: string) => void;
  updateCursor: (blogId: string, userId: string, cursor: any) => void;
  saveDraft: (blogId: string, userId: string, content: { contentHTML?: string }) => void;
  onPresence: (cb: (presence: any) => void) => void;
  onSaved: (cb: (info: { blogId: string; updatedAt: string | number }) => void) => void;
  disconnect: () => void;
};

export function getBackendBase() {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin.replace(/:\\d+$/, ':4000');
  return '';
}

export async function connectCollab(): Promise<CollabClient> {
  const base = getBackendBase();
  // Lazy import to avoid SSR issues
  const { io } = await import('socket.io-client');
  const socket = io(base, { withCredentials: true, transports: ['websocket'] });

  const api: CollabClient = {
    socket,
    join: (blogId, userId, cursor) => socket.emit('joinSession', { blogId, userId, cursor }),
    leave: (blogId, userId) => socket.emit('leaveSession', { blogId, userId }),
    updateCursor: (blogId, userId, cursor) => socket.emit('cursorUpdate', { blogId, userId, cursor }),
    saveDraft: (blogId, userId, content) => socket.emit('saveDraft', { blogId, userId, content }),
    onPresence: (cb) => { socket.on('presenceUpdate', cb); },
    onSaved: (cb) => { socket.on('saved', cb as any); },
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
