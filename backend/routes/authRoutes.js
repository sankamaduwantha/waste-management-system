const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
  uploadProfileImage
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateUserRegistration, validateLogin } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/multer');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/update-password', protect, updatePassword);
router.put('/update-profile', protect, updateProfile);
router.post('/upload-profile-image', protect, upload.single('profileImage'), uploadProfileImage);

module.exports = router;
