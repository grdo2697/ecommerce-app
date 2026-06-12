const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// إنشاء مجلد الرفع إذا لم يكن موجوداً
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مسموح به. الأنواع المسموحة: JPEG, PNG, WebP, GIF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// رفع صورة منتج
router.post('/product-image', authenticate, isAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'لم يتم رفع أي صورة' });
  }

  const imageUrl = `/uploads/products/${req.file.filename}`;
  res.json({
    success: true,
    message: 'تم رفع الصورة بنجاح',
    data: { url: imageUrl, filename: req.file.filename }
  });
});

// رفع عدة صور
router.post('/product-images', authenticate, isAdmin, upload.array('images', 10), (req, res) => {
  if (!req.files || !req.files.length) {
    return res.status(400).json({ success: false, message: 'لم يتم رفع أي صور' });
  }

  const images = req.files.map(file => ({
    url: `/uploads/products/${file.filename}`,
    filename: file.filename
  }));

  res.json({
    success: true,
    message: `تم رفع ${images.length} صورة بنجاح`,
    data: { images }
  });
});

// رفع صورة شخصية للمستخدم
const avatarDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  }
});

const avatarUpload = multer({ storage: avatarStorage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

const db = require('../config/database');

router.post('/avatar', authenticate, avatarUpload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'لم يتم رفع أي صورة' });
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);

  res.json({
    success: true,
    message: 'تم تحديث الصورة الشخصية',
    data: { url: avatarUrl }
  });
});

module.exports = router;
