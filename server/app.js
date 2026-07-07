const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { corsOptions } = require('./src/config/cors');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.locals.io = {
  emit: () => {},
};

app.use(cors(corsOptions));
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
