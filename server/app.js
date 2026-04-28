const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.locals.io = {
  emit: () => {},
};

const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

app.get('/', (req, res) => {
  res.send('Workoutly API is running...');
});

app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/workouts', require('./src/routes/workoutRoutes'));
app.use('/api/upload', require('./src/routes/upload'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;