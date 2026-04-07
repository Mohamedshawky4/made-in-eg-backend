const express = require('express');
const categoryController = require('./category.controller');
const authMiddleware = require('../auth/auth.middleware');

const router = express.Router();

router
  .route('/')
  .get(categoryController.getAllCategories)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    categoryController.createCategory
  );

router
  .route('/:idOrSlug')
  .get(categoryController.getCategory)

router
  .route('/:id')
  .put(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    categoryController.updateCategory
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    categoryController.deleteCategory
  );

module.exports = router;
