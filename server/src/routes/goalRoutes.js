const express = require('express');
const {
  getCurrentGoal,
  updateCurrentGoal,
  getGoalSummary,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/current', protect, getCurrentGoal);
router.put('/current', protect, updateCurrentGoal);
router.get('/summary', protect, getGoalSummary);

module.exports = router;
