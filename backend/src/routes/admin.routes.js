const express = require('express');
const router = express.Router();
const { getDashboardStats, getUsers, toggleUserStatus, getAllOrders } = require('../controllers/admin.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.use(authenticate, isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/orders', getAllOrders);

// Coupons management
router.get('/coupons', async (req, res) => {
  try {
    const [coupons] = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json({ success: true, data: { coupons } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الكوبونات' });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const { code, type, value, min_order, max_uses, expires_at } = req.body;
    if (!code || !value) return res.status(400).json({ success: false, message: 'الكود والقيمة مطلوبة' });
    
    await db.query(
      'INSERT INTO coupons (code, type, value, min_order, max_uses, expires_at, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [code.toUpperCase(), type || 'percentage', value, min_order || 0, max_uses || null, expires_at || null]
    );
    res.status(201).json({ success: true, message: 'تم إضافة الكوبون' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'الكود مستخدم مسبقاً' });
    res.status(500).json({ success: false, message: 'خطأ في إضافة الكوبون' });
  }
});

router.patch('/coupons/:id/toggle', async (req, res) => {
  try {
    await db.query('UPDATE coupons SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'تم تحديث الكوبون' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ' });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'تم حذف الكوبون' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في الحذف' });
  }
});

module.exports = router;
