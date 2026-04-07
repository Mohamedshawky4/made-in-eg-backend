const express = require('express');
const reviewController = require('./review.controller');
const authMiddleware = require('../auth/auth.middleware');

const router = express.Router();

router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.use(authMiddleware.protect);

router.post('/', reviewController.createReview);
router.delete('/:id', reviewController.deleteReview); // Owner or admin

module.exports = router;
