const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./src/routes/userRoutes'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Workoutly API is running...');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
