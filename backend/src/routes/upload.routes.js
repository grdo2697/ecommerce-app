const express = require('express');
const router = express.Router();
const multer = require('multer');
const https = require('https');
const FormData = require('form-data');
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

const UPLOADCARE_PUBLIC_KEY = process.env.UPLOADCARE_PUBLIC_KEY || '530476f6781c51879c13';

// رفع صورة لـ Uploadcare
const uploadToUploadcare = (fileBuffer, fileName, mimeType) => {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('UPLOADCARE_PUB_KEY', UPLOADCARE_PUBLIC_KEY);
    form.append('UPLOADCARE_STORE', '1');
    form.append('file', fileBuffer, { filename: fileName, contentType: mimeType });

    const options = {
      method: 'POST',
      host: 'upload.uploadcare.com',
      path: '/base/',
      headers: form.getHeaders(),
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.file) {
            resolve(`https://ucarecdn.com/${parsed.file}/`);
          } else {
            reject(new Error('Upload failed: ' + data));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
};

// رفع صورة منتج
router.post('/product-image', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'لم يتم رفع أي صورة' });
  try {
    const url = await uploadToUploadcare(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ success: true, message: 'تم رفع الصورة بنجاح', data: { url } });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ success: false, message: 'فشل رفع الصورة: ' + err.message });
  }
});

// رفع عدة صور
router.post('/product-images', authenticate, isAdmin, upload.array('images', 10), async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'لم يتم رفع أي صور' });
  try {
    const images = [];
    for (const file of req.files) {
      const url = await uploadToUploadcare(file.buffer, file.originalname, file.mimetype);
      images.push({ url });
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
    const avatarUrl = await uploadToUploadcare(req.file.buffer, req.file.originalname, req.file.mimetype);
    await db.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);
    res.json({ success: true, message: 'تم تحديث الصورة الشخصية', data: { url: avatarUrl } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'فشل رفع الصورة' });
  }
});

module.exports = router;