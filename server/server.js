const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

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

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Workoutly API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
