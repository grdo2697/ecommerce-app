const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, updateThumbnail
} = require('../controllers/product.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const { handleValidationErrors, sanitizeInputs } = require('../middleware/validation.middleware');

router.use(sanitizeInputs);

// عام - جلب جميع المنتجات مع فلترة
router.get('/', getProducts);

// عام - جلب منتج واحد بالـ slug
router.get('/:slug', getProduct);

// Admin only - إنشاء منتج
router.post('/', authenticate, isAdmin, [
  body('name').trim().notEmpty().withMessage('اسم المنتج مطلوب'),
  body('price').isFloat({ min: 0 }).withMessage('السعر يجب أن يكون رقماً موجباً'),
  body('stock').isInt({ min: 0 }).withMessage('المخزون يجب أن يكون رقماً موجباً'),
  handleValidationErrors
], createProduct);

// Admin only - تعديل منتج
router.put('/:id', authenticate, isAdmin, updateProduct);

// Admin only - تحديث الصورة
router.patch('/:id/thumbnail', authenticate, isAdmin, updateThumbnail);

// Admin only - حذف منتج
router.delete('/:id', authenticate, isAdmin, deleteProduct);

module.exports = router;
