/**
 * Authentication Middleware
 * يتحقق من JWT token في كل request محمي
 */

const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * التحقق من JWT Token
 */
const authenticate = async (req, res, next) => {
  try {
    // استخراج التوكن من الـ Header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول للوصول لهذه الصفحة'
      });
    }

    const token = authHeader.split(' ')[1];

    // التحقق من صحة التوكن
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'توكن غير صالح'
      });
    }

    // التحقق من وجود المستخدم في قاعدة البيانات
    const [users] = await db.query(
      'SELECT id, name, email, role, is_active, avatar FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'تم تعليق هذا الحساب، تواصل مع الدعم'
      });
    }

    // إضافة بيانات المستخدم للـ request
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من المصادقة'
    });
  }
};

/**
 * التحقق من صلاحيات المدير فقط
 */
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'غير مصرح لك بالوصول لهذه الصفحة'
    });
  }
  next();
};

/**
 * authenticate اختياري (يضيف بيانات المستخدم إن وجد التوكن، ولا يرفض بدونه)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.query(
      'SELECT id, name, email, role, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length && users[0].is_active) {
      req.user = users[0];
    }

    next();
  } catch {
    next(); // إذا فشل التحقق، تابع بدون مستخدم
  }
};

module.exports = { authenticate, isAdmin, optionalAuth };
