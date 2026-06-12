const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth.middleware');

// تحديث الملف الشخصي
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone } = req.body;
    await db.query(
      'UPDATE users SET name=COALESCE(?,name), phone=COALESCE(?,phone) WHERE id=?',
      [name, phone, req.user.id]
    );
    res.json({ success: true, message: 'تم تحديث الملف الشخصي' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في التحديث' });
  }
});

// تغيير كلمة المرور
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });

    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const isValid = await bcrypt.compare(current_password, users[0].password);
    if (!isValid)
      return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });

    const hashed = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في تغيير كلمة المرور' });
  }
});

// جلب عناوين المستخدم
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const [addresses] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC',
      [req.user.id]
    );
    res.json({ success: true, data: { addresses } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في جلب العناوين' });
  }
});

// إضافة عنوان
router.post('/addresses', authenticate, async (req, res) => {
  try {
    const { title, full_name, phone, country, city, state, address, postal_code, is_default } = req.body;
    if (is_default) {
      await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }
    const [result] = await db.query(
      'INSERT INTO addresses (user_id, title, full_name, phone, country, city, state, address, postal_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, full_name, phone, country, city, state, address, postal_code, is_default ? 1 : 0]
    );
    res.status(201).json({ success: true, message: 'تم إضافة العنوان', data: { id: result.insertId } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في إضافة العنوان' });
  }
});

// حذف عنوان
router.delete('/addresses/:id', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'تم حذف العنوان' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في حذف العنوان' });
  }
});

module.exports = router;
