const express = require('express');
const { createWorkout, getWorkouts } = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, createWorkout).get(protect, getWorkouts);

module.exports = router;
