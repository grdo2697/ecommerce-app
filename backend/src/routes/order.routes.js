const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getOrder, updateOrderStatus } = require('../controllers/order.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:id', authenticate, getOrder);
router.patch('/:id/status', authenticate, isAdmin, updateOrderStatus);

module.exports = router;

// تتبع الطلب بدون تسجيل دخول
const express2 = require('express');
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const db = require('../config/database');
    const { orderNumber } = req.params;
    const [orders] = await db.query(
      'SELECT id, order_number, status, payment_status, total, subtotal, discount, shipping_address, created_at FROM orders WHERE order_number = ?',
      [orderNumber.toUpperCase()]
    );
    if (!orders.length) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    const order = orders[0];
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.shipping_address = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
    res.json({ success: true, data: { order: { ...order, items } } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'خطأ في تتبع الطلب' });
  }
});
