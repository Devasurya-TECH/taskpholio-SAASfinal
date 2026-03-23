const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { 
  rateLimitBypass, 
  checkTrustedIP, 
  authLimiter, 
  emailLimiter 
} = require('../middleware/rateLimiter');
const { checkAccountLockout } = require('../middleware/accountLockout');
const { 
  getPublicTeams, 
  register, 
  login, 
  getMe, 
  logout,
  verifyEmail, 
  forgotPassword, 
  resetPassword, 
  updatePassword,
  getAllUsers, 
  updateUser, 
  deleteUser 
} = require('../controllers/authController');
const { requireAuth, requirePermission } = require('../middleware/auth');

// Public routes
router.get('/public-teams', getPublicTeams);
router.post('/register', 
  rateLimitBypass,
  authLimiter,
  register
);
router.post('/login', 
  rateLimitBypass,
  checkTrustedIP,
  checkAccountLockout,
  emailLimiter,
  authLimiter,
  login
);

// Email Verification & Password Recovery
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);
router.post('/update-password', requireAuth, updatePassword);

// Admin user management
router.get('/users', requireAuth, requirePermission('manage_users'), getAllUsers);
router.patch('/users/:id', requireAuth, requirePermission('manage_users'), updateUser);
router.delete('/users/:id', requireAuth, requirePermission('manage_users'), deleteUser);

module.exports = router;
