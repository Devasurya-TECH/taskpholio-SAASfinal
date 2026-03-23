const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { 
  createMeeting, 
  getMeetings, 
  updateMeeting, 
  updateAttendance,
  cancelMeeting 
} = require('../controllers/meetingController');

router.use(requireAuth);

router.post('/', createMeeting);
router.get('/', getMeetings);
router.patch('/:id', updateMeeting);
router.patch('/:id/attendance', updateAttendance);
router.delete('/:id', cancelMeeting);

module.exports = router;
