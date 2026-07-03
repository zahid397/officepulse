// backend/socket.js
// Centralised Socket.io init. Returns the io instance so the simulator and
// other services can broadcast updates without re-initialising the server.

const { Server } = require('socket.io');

let io = null;

function initSocket(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin || '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(`[socket] Client connected: ${socket.id}`);
    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log(`[socket] Client disconnected: ${socket.id} (${reason})`);
    });
    // Lightweight health ping — clients can use this to confirm liveness.
    socket.on('ping', () => socket.emit('pong', { t: Date.now() }));
  });

  return io;
}

function getIo() {
  return io;
}

module.exports = { initSocket, getIo };
