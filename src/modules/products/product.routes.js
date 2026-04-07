const express = require('express');
const productController = require('./product.controller');
const authMiddleware = require('../auth/auth.middleware');
const { validate, createProductSchema, updateProductSchema } = require('./product.validator');

const router = express.Router();

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    validate(createProductSchema),
    productController.createProduct
  );

router.get('/related/:id', productController.getRelatedProducts);

router
  .route('/:id')
  .get(productController.getProduct)
  .put(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    validate(updateProductSchema),
    productController.updateProduct
  )
  .delete(
    authMiddleware.protect,
    authMiddleware.restrictTo('admin'),
    productController.deleteProduct
  );

module.exports = router;
