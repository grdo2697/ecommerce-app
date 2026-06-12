// ============================================
// src/routes/category.routes.js
// ============================================
const express = require('express');
const categoryRouter = express.Router();
const db = require('../config/database');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

categoryRouter.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC'
    );
    res.json({ success: true, data: { categories } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في جلب التصنيفات' });
  }
});

categoryRouter.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, name_ar, description, parent_id } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'اسم التصنيف مطلوب' });

    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now();
    const [result] = await db.query(
      'INSERT INTO categories (name, name_ar, slug, description, parent_id) VALUES (?, ?, ?, ?, ?)',
      [name, name_ar || null, slug, description || null, parent_id || null]
    );
    const [cat] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'تم إنشاء التصنيف', data: { category: cat[0] } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في إنشاء التصنيف' });
  }
});

categoryRouter.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, name_ar, description, is_active } = req.body;
    await db.query(
      'UPDATE categories SET name=COALESCE(?,name), name_ar=COALESCE(?,name_ar), description=COALESCE(?,description), is_active=COALESCE(?,is_active) WHERE id=?',
      [name, name_ar, description, is_active, req.params.id]
    );
    res.json({ success: true, message: 'تم تعديل التصنيف' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في تعديل التصنيف' });
  }
});

categoryRouter.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await db.query('UPDATE categories SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'تم حذف التصنيف' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في حذف التصنيف' });
  }
});

module.exports = categoryRouter;
