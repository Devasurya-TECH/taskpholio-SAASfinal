const express = require('express');
const router = express.Router();
const { requireAuth, requirePermission, requireTaskAccess } = require('../middleware/auth');
const { strictUserLimiter } = require('../middleware/rateLimiter');
const { upload } = require('../config/cloudinary');
const {
  getTasks, 
  getTask, 
  createTask, 
  updateTask, 
  deleteTask,
  addComment,
  addSubtask,
  toggleSubtask,
  archiveTask
} = require('../controllers/taskController');

router.use(requireAuth);
router.use(strictUserLimiter);

router.get('/', getTasks);
router.post('/', requirePermission('create_tasks'), createTask);

router.get('/:id', requireTaskAccess, getTask);
router.patch('/:id', requireTaskAccess, updateTask);
router.delete('/:id', requireTaskAccess, archiveTask); // Use archive instead of hard delete for SaaS

// Enhanced Features
router.post('/:id/comments', requireTaskAccess, addComment);
router.post('/:id/subtasks', requireTaskAccess, addSubtask);
router.patch('/:id/subtasks/:subtaskId', requireTaskAccess, toggleSubtask);

module.exports = router;
