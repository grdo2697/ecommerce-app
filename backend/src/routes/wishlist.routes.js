const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth.middleware');

// جلب قائمة الرغبات
router.get('/', authenticate, async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT w.id, w.product_id, w.created_at,
        p.name, p.name_ar, p.slug, p.price, p.sale_price, p.thumbnail, p.stock, p.avg_rating
      FROM wishlists w JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ? ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, data: { items } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في جلب قائمة الرغبات' });
  }
});

// إضافة/إزالة منتج من قائمة الرغبات (toggle)
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ success: false, message: 'product_id مطلوب' });

    const [existing] = await db.query(
      'SELECT id FROM wishlists WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existing.length) {
      await db.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, product_id]);
      res.json({ success: true, message: 'تمت الإزالة من قائمة الرغبات', added: false });
    } else {
      await db.query('INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)', [req.user.id, product_id]);
      res.json({ success: true, message: 'تمت الإضافة لقائمة الرغبات', added: true });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث قائمة الرغبات' });
  }
});

module.exports = router;
