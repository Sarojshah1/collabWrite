// Basic user-targeted notifications over Socket.IO.
// Clients should connect and emit 'auth' with their userId to join their personal room.

export function initNotificationSocket(io) {
  io.on('connection', (socket) => {
    // Authenticate socket to a user room
    socket.on('auth', ({ userId }) => {
      if (!userId) return;
      socket.join(userRoom(userId));
      socket.emit('notifications:ready');
    });

    socket.on('disconnect', () => {
      // cleanup handled by socket.io
    });
  });
}

export function userRoom(userId) {
  return `user:${userId}`;
}

// Utility to emit a notification to a specific user
export function emitNotification(io, userId, payload) {
  io.to(userRoom(userId)).emit('notification', payload);
}
