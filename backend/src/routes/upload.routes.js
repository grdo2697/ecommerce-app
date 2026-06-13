const express = require('express');
const router = express.Router();
const multer = require('multer');
const { UploadcareSimpleAuthSchema, uploadFile } = require('@uploadcare/rest-client');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const db = require('../config/database');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('نوع الملف غير مسموح'), false);
  }
});

const getUploadcareClient = () => {
  return new UploadcareSimpleAuthSchema({
    publicKey: process.env.UPLOADCARE_PUBLIC_KEY || '530476f6781c51879c13',
    secretKey: process.env.UPLOADCARE_SECRET_KEY || 'cf62ffc46869cb6d8dce',
  });
};

// رفع صورة منتج
router.post('/product-image', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم رفع أي صورة' });
  try {
    const authSchema = getUploadcareClient();
    const result = await uploadFile(
      req.file.buffer,
      { publicKey: process.env.UPLOADCARE_PUBLIC_KEY || '530476f6781c51879c13' },
      { fileName: req.file.originalname, contentType: req.file.mimetype }
    );
    const imageUrl = `https://ucarecdn.com/${result.uuid}/`;
    res.json({ success: true, message: 'تم رفع الصورة بنجاح', data: { url: imageUrl } });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'فشل رفع الصورة' });
  }
});

// رفع عدة صور
router.post('/product-images', authenticate, isAdmin, upload.array('images', 10), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'لم يتم رفع أي صور' });
  try {
    const images = [];
    for (const file of req.files) {
      const result = await uploadFile(
        file.buffer,
        { publicKey: process.env.UPLOADCARE_PUBLIC_KEY || '530476f6781c51879c13' },
        { fileName: file.originalname, contentType: file.mimetype }
      );
      images.push({ url: `https://ucarecdn.com/${result.uuid}/` });
    }
    res.json({ success: true, message: `تم رفع ${images.length} صورة`, data: { images } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'فشل رفع الصور' });
  }
});

// رفع صورة شخصية
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم رفع أي صورة' });
  try {
    const result = await uploadFile(
      req.file.buffer,
      { publicKey: process.env.UPLOADCARE_PUBLIC_KEY || '530476f6781c51879c13' },
      { fileName: req.file.originalname, contentType: req.file.mimetype }
    );
    const avatarUrl = `https://ucarecdn.com/${result.uuid}/`;
    await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);
    res.json({ success: true, message: 'تم تحديث الصورة الشخصية', data: { url: avatarUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'فشل رفع الصورة' });
  }
});

module.exports = router;