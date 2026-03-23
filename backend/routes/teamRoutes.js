const express = require('express');
const router = express.Router();
const { requireAuth, requirePermission } = require('../middleware/auth');
const { 
  getTeams, 
  getTeam, 
  createTeam, 
  updateTeam, 
  addMembers 
} = require('../controllers/teamController');

router.use(requireAuth);

router.get('/', getTeams);
router.get('/:id', getTeam);

// Admin / CEO / CTO restricted
router.post('/', requirePermission('manage_teams'), createTeam);
router.patch('/:id', requirePermission('manage_teams'), updateTeam);
router.post('/:id/members', requirePermission('manage_teams'), addMembers);

module.exports = router;
