const express = require('express');
const {
  createSession,
  getSessions,
  getSessionCalendar,
  exportSessionsCsv,
  getRecentSessions,
  getSessionSummary,
  getExerciseProgress,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, createSession).get(protect, getSessions);
router.get('/calendar', protect, getSessionCalendar);
router.get('/export.csv', protect, exportSessionsCsv);
router.get('/progress', protect, getExerciseProgress);
router.get('/recent', protect, getRecentSessions);
router.get('/summary', protect, getSessionSummary);

module.exports = router;
