const express = require('express');
const { getRecords, getRecordsByExercise } = require('../controllers/recordController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getRecords);
router.get('/:exerciseName', protect, getRecordsByExercise);

module.exports = router;
