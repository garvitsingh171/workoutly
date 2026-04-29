const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Load env vars
dotenv.config();

const app = require('./app');

// Connect to database
connectDB();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.locals.io = io;

io.use(async (socket, next) => {
  const token = socket.handshake?.auth?.token;

  if (!token) {
    return next(new Error('No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('_id name email');

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.data.user = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    return next();
  } catch (error) {
    return next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id} | User: ${socket.data.user.email}`);

  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id} (${reason})`);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for connections`);
});
