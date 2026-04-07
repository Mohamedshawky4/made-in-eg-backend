const express = require('express');
const authController = require('./auth.controller');
const authValidator = require('./auth.validator');
const { protect } = require('./auth.middleware');

const router = express.Router();

// Public Routes
router.post(
  '/register',
  authValidator.validate(authValidator.registerSchema),
  authController.register
);

router.post(
  '/login',
  authValidator.validate(authValidator.loginSchema),
  authController.login
);

router.post('/refresh', authController.refresh);

// Hidden route to bootstrap first admin (Requires Secret Header)
router.post('/admin/bootstrap', authValidator.validate(authValidator.registerSchema), authController.createAdmin);

// Protected Routes
router.use(protect);

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);

module.exports = router;
