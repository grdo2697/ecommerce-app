// ===== src/routes/auth.routes.js =====
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, forgotPassword, resetPassword, getMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidationErrors, sanitizeInputs } = require('../middleware/validation.middleware');

router.use(sanitizeInputs);

// تسجيل مستخدم جديد
router.post('/register', [
  body('name').trim().notEmpty().withMessage('الاسم مطلوب').isLength({ min: 2, max: 100 }),
  body('email').isEmail().withMessage('بريد إلكتروني غير صالح').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  handleValidationErrors
], register);

// تسجيل الدخول
router.post('/login', [
  body('email').isEmail().withMessage('بريد إلكتروني غير صالح').normalizeEmail(),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
  handleValidationErrors
], login);

// طلب استعادة كلمة المرور
router.post('/forgot-password', [
  body('email').isEmail().withMessage('بريد إلكتروني غير صالح').normalizeEmail(),
  handleValidationErrors
], forgotPassword);

// إعادة تعيين كلمة المرور
router.post('/reset-password', [
  body('token').notEmpty().withMessage('التوكن مطلوب'),
  body('password').isLength({ min: 8 }).withMessage('كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  handleValidationErrors
], resetPassword);

// جلب بيانات المستخدم الحالي
router.get('/me', authenticate, getMe);

module.exports = router;
