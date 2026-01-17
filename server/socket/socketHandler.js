const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join room based on username
    socket.on('join', (username) => {
      if (username) {
        socket.join(username.toLowerCase());
        console.log(`${socket.id} joined room: ${username}`);
      }
    });

    // Leave room
    socket.on('leave', (username) => {
      if (username) {
        socket.leave(username.toLowerCase());
        console.log(`${socket.id} left room: ${username}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupSocket;
