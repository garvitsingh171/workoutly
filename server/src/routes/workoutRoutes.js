const express = require('express');
const {
	createWorkout,
	getWorkouts,
	getWorkoutById,
	updateWorkout,
	deleteWorkout,
	duplicateWorkout,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');
const { workoutIdValidator, workoutValidator } = require('../validators/workoutValidators');
const validateRequest = require('../validators/validateRequest');

const router = express.Router();

router
	.route('/')
	.post(protect, workoutValidator, validateRequest, createWorkout)
	.get(protect, getWorkouts);

router
	.route('/:id/duplicate')
	.post(protect, workoutIdValidator, validateRequest, duplicateWorkout);

router
	.route('/:id')
	.get(protect, workoutIdValidator, validateRequest, getWorkoutById)
	.put(protect, workoutIdValidator, workoutValidator, validateRequest, updateWorkout)
	.delete(protect, workoutIdValidator, validateRequest, deleteWorkout);

module.exports = router;
