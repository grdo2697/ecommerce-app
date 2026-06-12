/**
 * Validation Middleware
 * يتحقق من صحة البيانات المدخلة ويحمي من XSS
 */

const { validationResult } = require('express-validator');
const xss = require('xss');

/**
 * معالج أخطاء الـ validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().reduce((acc, err) => {
      if (!acc[err.path]) {
        acc[err.path] = err.msg;
      }
      return acc;
    }, {});

    return res.status(422).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: formattedErrors
    });
  }

  next();
};

/**
 * تنظيف المدخلات من XSS attacks
 */
const sanitizeInputs = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return xss(obj.trim());
    }
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);

  next();
};

module.exports = { handleValidationErrors, sanitizeInputs };
