/**
 * Order Controller - نظام الطلبات بدون دفع
 * كل طلب له رقم تكت يبدأ من FO0001
 */

const db = require('../config/database');

/**
 * توليد رقم تكت بالتسلسل FO0001, FO0002...
 */
const generateTicketNumber = async (connection) => {
  const [rows] = await connection.query(
    "SELECT order_number FROM orders WHERE order_number LIKE 'FO%' ORDER BY id DESC LIMIT 1"
  );
  if (!rows.length) return 'FO0001';
  const last = parseInt(rows[0].order_number.replace('FO', '')) || 0;
  return 'FO' + String(last + 1).padStart(4, '0');
};

/**
 * إنشاء طلب جديد (بدون دفع - Cash on Delivery)
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { items, shipping_address, notes, coupon_code } = req.body;
    const userId = req.user.id;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'السلة فارغة' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const [products] = await connection.query(
        'SELECT id, name, name_ar, price, sale_price, stock, thumbnail FROM products WHERE id = ? AND is_active = 1',
        [item.product_id]
      );

      if (!products.length) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `المنتج غير متوفر` });
      }

      const product = products[0];

      if (product.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `الكمية المطلوبة من "${product.name_ar || product.name}" غير متوفرة`
        });
      }

      const unitPrice = product.sale_price || product.price;
      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product_id: product.id,
        product_name: product.name_ar || product.name,
        product_image: product.thumbnail,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice
      });
    }

    // تطبيق كوبون الخصم
    let discount = 0;
    if (coupon_code) {
      const [coupons] = await connection.query(`
        SELECT * FROM coupons 
        WHERE code = ? AND is_active = 1 
          AND (expires_at IS NULL OR expires_at > NOW())
          AND (max_uses IS NULL OR used_count < max_uses)
          AND min_order <= ?
      `, [coupon_code.toUpperCase(), subtotal]);

      if (coupons.length) {
        const coupon = coupons[0];
        discount = coupon.type === 'percentage'
          ? (subtotal * coupon.value / 100)
          : Math.min(coupon.value, subtotal);
        await connection.query(
          'UPDATE coupons SET used_count = used_count + 1 WHERE id = ?',
          [coupon.id]
        );
      }
    }

    const total = Math.max(0, subtotal - discount);

    // توليد رقم التكت التسلسلي
    const orderNumber = await generateTicketNumber(connection);

    // إنشاء الطلب - الدفع عند الاستلام
    const [orderResult] = await connection.query(`
      INSERT INTO orders (
        order_number, user_id, status, payment_status, payment_method,
        subtotal, discount, shipping_cost, tax, total,
        shipping_address, notes
      ) VALUES (?, ?, 'pending', 'pending', 'cash_on_delivery', ?, ?, 0, 0, ?, ?, ?)
    `, [
      orderNumber, userId,
      subtotal, discount, total,
      JSON.stringify(shipping_address),
      notes || null
    ]);

    const orderId = orderResult.insertId;

    // إدراج عناصر الطلب وتخفيض المخزون
    for (const item of orderItems) {
      await connection.query(`
        INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [orderId, item.product_id, item.product_name, item.product_image,
          item.quantity, item.unit_price, item.total_price]);

      await connection.query(
        'UPDATE products SET stock = stock - ?, total_sold = total_sold + ? WHERE id = ?',
        [item.quantity, item.quantity, item.product_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'تم إرسال طلبك بنجاح! سنتواصل معك قريباً',
      data: { orderId, orderNumber, total, discount }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في إنشاء الطلب' });
  } finally {
    connection.release();
  }
};

/**
 * جلب طلبات المستخدم
 */
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [orders] = await db.query(`
      SELECT 
        o.id, o.order_number, o.status, o.payment_status,
        o.total, o.discount, o.created_at,
        COUNT(oi.id) AS items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, parseInt(limit), offset]);

    const [countResult] = await db.query(
      'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب الطلبات' });
  }
};

/**
 * جلب تفاصيل طلب
 */
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(`
      SELECT o.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id]);

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    const order = orders[0];

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك' });
    }

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);

    order.shipping_address = typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address)
      : order.shipping_address;

    res.json({ success: true, data: { order: { ...order, items } } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب الطلب' });
  }
};

/**
 * تحديث حالة الطلب (Admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
    }

    const updates = [status];
    let sql = 'UPDATE orders SET status = ?';

    if (admin_notes) {
      sql += ', admin_notes = ?';
      updates.push(admin_notes);
    }
    if (status === 'shipped') {
      sql += ', shipped_at = NOW()';
    }
    if (status === 'delivered') {
      sql += ', delivered_at = NOW(), payment_status = "paid"';
    }

    sql += ' WHERE id = ?';
    updates.push(id);

    await db.query(sql, updates);

    res.json({ success: true, message: 'تم تحديث حالة الطلب' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ في تحديث الطلب' });
  }
};

module.exports = { createOrder, getUserOrders, getOrder, updateOrderStatus };
