const express = require('express');
const { getExercises, createExercise } = require('../controllers/exerciseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getExercises).post(protect, createExercise);

module.exports = router;
