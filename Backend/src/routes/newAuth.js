const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth/newAuthController');
const { verifyToken } = require('../middleware/newAuth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.post('/logout', verifyToken, authController.logout);
router.get('/me', verifyToken, authController.me);
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
