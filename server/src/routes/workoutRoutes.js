const express = require('express');
const {
	createWorkout,
	getWorkouts,
	getWorkoutById,
	updateWorkout,
	deleteWorkout,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');

module.exports = function (io) {
	const router = express.Router();

	router
		.route('/')
		.post(protect, (req, res, next) => {
			req.io = io;
			return createWorkout(req, res, next);
		})
		.get(protect, getWorkouts);

	router.route('/:id').get(protect, getWorkoutById).put(protect, updateWorkout).delete(protect, deleteWorkout);

	return router;
};
