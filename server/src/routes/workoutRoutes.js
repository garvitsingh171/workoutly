const express = require('express');
const {
	createWorkout,
	getWorkouts,
	getWorkoutById,
	updateWorkout,
	deleteWorkout,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, createWorkout).get(protect, getWorkouts);
router.route('/:id').get(protect, getWorkoutById).put(protect, updateWorkout).delete(protect, deleteWorkout);

module.exports = router;
