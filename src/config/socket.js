let io;

const init = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { init, getIo };
