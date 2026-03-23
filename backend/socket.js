const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const logger = require('./utils/logger');

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket auth error:', error.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`✅ Operative Connected: ${socket.user.name} - SID: ${socket.id}`);

    // Join user-specific room
    socket.join(`user_${socket.user._id}`);

    // Join team room
    if (socket.user.team) {
      socket.join(`team_${socket.user.team}`);
    }

    // Handle custom room joining
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`task_${data.taskId}`).emit('user_typing', {
        userId: socket.user._id,
        userName: socket.user.name,
        taskId: data.taskId
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`task_${data.taskId}`).emit('user_stopped_typing', {
        userId: socket.user._id,
        taskId: data.taskId
      });
    });

    // Disconnect handler
    socket.on('disconnect', async () => {
      logger.info(`❌ Operative Disconnected: ${socket.user.name}`);
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  return io;
}

module.exports = { initializeSocket };
