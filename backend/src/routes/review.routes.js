// ============================================
// Review Routes - src/routes/review.routes.js
// ============================================
const express = require('express');
const reviewRouter = express.Router();
const db = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// إضافة تقييم
reviewRouter.post('/', authenticate, async (req, res) => {
  try {
    const { product_id, rating, title, comment } = req.body;
    if (!product_id || !rating) return res.status(400).json({ success: false, message: 'المنتج والتقييم مطلوبان' });

    await db.query(
      'INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating=?, title=?, comment=?, updated_at=NOW()',
      [product_id, req.user.id, rating, title, comment, rating, title, comment]
    );

    // تحديث متوسط التقييم في المنتج
    await db.query(`
      UPDATE products SET 
        avg_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ? AND is_approved = 1),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND is_approved = 1)
      WHERE id = ?
    `, [product_id, product_id, product_id]);

    res.status(201).json({ success: true, message: 'تم إرسال تقييمك بنجاح، سيظهر بعد المراجعة' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في إضافة التقييم' });
  }
});

// الموافقة على تقييم (Admin)
reviewRouter.patch('/:id/approve', authenticate, isAdmin, async (req, res) => {
  try {
    const [review] = await db.query('SELECT product_id FROM reviews WHERE id = ?', [req.params.id]);
    if (!review.length) return res.status(404).json({ success: false, message: 'التقييم غير موجود' });

    await db.query('UPDATE reviews SET is_approved = 1 WHERE id = ?', [req.params.id]);

    const pid = review[0].product_id;
    await db.query(`
      UPDATE products SET 
        avg_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ? AND is_approved = 1),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND is_approved = 1)
      WHERE id = ?
    `, [pid, pid, pid]);

    res.json({ success: true, message: 'تمت الموافقة على التقييم' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في الموافقة على التقييم' });
  }
});

// جلب التقييمات المعلقة (Admin)
reviewRouter.get('/pending', authenticate, isAdmin, async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, u.name AS user_name, p.name AS product_name
      FROM reviews r JOIN users u ON r.user_id = u.id JOIN products p ON r.product_id = p.id
      WHERE r.is_approved = 0 ORDER BY r.created_at DESC
    `);
    res.json({ success: true, data: { reviews } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ' });
  }
});

module.exports = reviewRouter;
