const express = require('express');
const orderController = require('./order.controller');
const authMiddleware = require('../auth/auth.middleware');
const { validate, createOrderSchema, updateOrderStatusSchema } = require('./order.validator');

const router = express.Router();

router.use(authMiddleware.protect); // All order routes require auth

// User routes
router
  .route('/')
  .post(validate(createOrderSchema), orderController.createOrder);

router.get('/my', orderController.getMyOrders);

// Admin routes
router
  .route('/all')
  .get(authMiddleware.restrictTo('admin'), orderController.getAllOrders);

router
  .route('/:id')
  .get(orderController.getOrder); // Owner or Admin

router
  .route('/:id/status')
  .patch(authMiddleware.restrictTo('admin'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);

module.exports = router;
