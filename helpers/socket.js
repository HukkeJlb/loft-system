const clients = {};

module.exports = io => {
  io.on("connection", socket => {
    const user = {
      id: socket.id,
      username: socket.handshake.headers.username
    };
    clients[socket.id] = user;
    socket.emit("all users", clients);
    io.sockets.emit("new user", user);
    socket.on("chat message", (msg, user) => {
      socket.broadcast.to(user).emit("chat message", msg, socket.id);
    });
    socket.on("disconnect", () => {
      io.sockets.emit("delete user", socket.id);
      delete clients[socket.id];
    });
  });
};
