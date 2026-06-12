/**
 * Admin Controller
 * لوحة التحكم - إحصائيات وإدارة
 */

const db = require('../config/database');

/**
 * إحصائيات لوحة التحكم
 * GET /api/admin/dashboard
 */
const getDashboardStats = async (req, res) => {
  try {
    // إجمالي المبيعات هذا الشهر
    const [salesStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_orders,
        SUM(total) AS total_revenue,
        AVG(total) AS avg_order_value
      FROM orders
      WHERE payment_status = 'paid'
        AND MONTH(created_at) = MONTH(NOW())
        AND YEAR(created_at) = YEAR(NOW())
    `);

    // إجمالي المستخدمين
    const [userStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_users,
        SUM(CASE WHEN MONTH(created_at) = MONTH(NOW()) THEN 1 ELSE 0 END) AS new_this_month
      FROM users WHERE role = 'user'
    `);

    // إجمالي المنتجات
    const [productStats] = await db.query(`
      SELECT 
        COUNT(*) AS total_products,
        SUM(CASE WHEN stock <= low_stock_alert THEN 1 ELSE 0 END) AS low_stock_count,
        SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS out_of_stock_count
      FROM products WHERE is_active = 1
    `);

    // آخر 7 أيام مبيعات
    const [weeklySales] = await db.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS orders,
        SUM(total) AS revenue
      FROM orders
      WHERE payment_status = 'paid'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // أكثر المنتجات مبيعاً
    const [topProducts] = await db.query(`
      SELECT 
        p.id, p.name, p.thumbnail, p.price, p.total_sold,
        SUM(oi.quantity) AS sold_quantity,
        SUM(oi.total_price) AS revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.payment_status = 'paid'
      GROUP BY p.id
      ORDER BY sold_quantity DESC
      LIMIT 5
    `);

    // آخر الطلبات
    const [recentOrders] = await db.query(`
      SELECT 
        o.id, o.order_number, o.status, o.payment_status,
        o.total, o.created_at,
        u.name AS user_name, u.email AS user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // توزيع الطلبات حسب الحالة
    const [orderStatusDist] = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM orders
      GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        sales: salesStats[0],
        users: userStats[0],
        products: productStats[0],
        weeklySales,
        topProducts,
        recentOrders,
        orderStatusDistribution: orderStatusDist
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب الإحصائيات' });
  }
};

/**
 * جلب جميع المستخدمين (Admin)
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = ['1=1'];
    let params = [];

    if (search) {
      where.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      where.push('role = ?');
      params.push(role);
    }

    const [users] = await db.query(`
      SELECT id, name, email, role, is_active, phone, avatar, created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = users.id) AS orders_count,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE user_id = users.id AND payment_status = 'paid') AS total_spent
      FROM users
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM users WHERE ${where.join(' AND ')}`,
      params
    );

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب المستخدمين' });
  }
};

/**
 * تفعيل/تعطيل مستخدم (Admin)
 * PATCH /api/admin/users/:id/toggle-status
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // منع الأدمن من تعطيل نفسه
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك تعطيل حسابك الخاص'
      });
    }

    await db.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = ?',
      [id]
    );

    res.json({ success: true, message: 'تم تحديث حالة المستخدم' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث المستخدم' });
  }
};

/**
 * جلب جميع الطلبات (Admin)
 * GET /api/admin/orders
 */
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, payment_status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = ['1=1'];
    let params = [];

    if (status) { where.push('o.status = ?'); params.push(status); }
    if (payment_status) { where.push('o.payment_status = ?'); params.push(payment_status); }

    const [orders] = await db.query(`
      SELECT 
        o.id, o.order_number, o.status, o.payment_status,
        o.total, o.created_at, o.shipping_address,
        u.name AS user_name, u.email AS user_email,
        COUNT(oi.id) AS items_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE ${where.join(' AND ')}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM orders o WHERE ${where.join(' AND ')}`,
      params
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
    res.status(500).json({ success: false, message: 'خطأ في جلب الطلبات' });
  }
};

module.exports = { getDashboardStats, getUsers, toggleUserStatus, getAllOrders };
