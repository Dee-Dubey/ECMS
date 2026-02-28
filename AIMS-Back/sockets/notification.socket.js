const socketIO = require('socket.io');
const notificationService = require('../services/notification.service.js');
const logger = require('../logger.js');

module.exports = function (server) {
  const io = socketIO(server, { cors: true })

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    })

    socket.on("notification", async () => {
      try {
        console.log('notification call is runing')
        const filteredComponents = await notificationService.getFilteredComponents();
        socket.emit("notification", filteredComponents);
      } catch (error) {
        logger.error("Error fetching component", { error });
      }
    });
  })

  return io
}