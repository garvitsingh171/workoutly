const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.locals.io = {
  emit: () => {},
};

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without Origin header (health checks, curl, Postman).
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

app.get('/', (req, res) => {
  res.send('Workoutly API is running...');
});

app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/workouts', require('./src/routes/workoutRoutes'));
app.use('/api/sessions', require('./src/routes/sessionRoutes'));
app.use('/api/goals', require('./src/routes/goalRoutes'));
app.use('/api/records', require('./src/routes/recordRoutes'));
app.use('/api/exercises', require('./src/routes/exerciseRoutes'));
app.use('/api/upload', require('./src/routes/upload'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
