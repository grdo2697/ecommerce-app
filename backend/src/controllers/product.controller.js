/**
 * Product Controller
 * إدارة المنتجات - عرض، بحث، فلترة
 */

const db = require('../config/database');

/**
 * جلب جميع المنتجات مع فلترة وبحث وترتيب
 * GET /api/products
 */
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = 'created_at',
      order = 'DESC',
      min_price,
      max_price,
      featured,
      in_stock
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // بناء الـ query بشكل ديناميكي
    let whereConditions = ['p.is_active = 1'];
    let params = [];

    if (category) {
      whereConditions.push('c.slug = ?');
      params.push(category);
    }

    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.name_ar LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (min_price) {
      whereConditions.push('COALESCE(p.sale_price, p.price) >= ?');
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      whereConditions.push('COALESCE(p.sale_price, p.price) <= ?');
      params.push(parseFloat(max_price));
    }

    if (featured === 'true') {
      whereConditions.push('p.is_featured = 1');
    }

    if (in_stock === 'true') {
      whereConditions.push('p.stock > 0');
    }

    const whereClause = whereConditions.join(' AND ');

    // أعمدة الترتيب المسموح بها فقط (لمنع SQL injection)
    const allowedSortFields = {
      'price': 'COALESCE(p.sale_price, p.price)',
      'name': 'p.name',
      'created_at': 'p.created_at',
      'avg_rating': 'p.avg_rating',
      'total_sold': 'p.total_sold'
    };

    const sortField = allowedSortFields[sort] || 'p.created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // جلب المنتجات
    const [products] = await db.query(`
      SELECT 
        p.id, p.name, p.name_ar, p.slug, p.price, p.sale_price,
        p.thumbnail, p.stock, p.is_featured, p.avg_rating, p.review_count,
        p.total_sold, p.created_at,
        c.name AS category_name, c.name_ar AS category_name_ar, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // إجمالي عدد المنتجات للـ pagination
    const [countResult] = await db.query(`
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
    `, params);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب المنتجات' });
  }
};

/**
 * جلب منتج واحد بالتفصيل
 * GET /api/products/:slug
 */
const getProduct = async (req, res) => {
  try {
    const { slug } = req.params;

    const [products] = await db.query(`
      SELECT 
        p.*,
        c.name AS category_name, c.name_ar AS category_name_ar, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? AND p.is_active = 1
    `, [slug]);

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: 'المنتج غير موجود'
      });
    }

    const product = products[0];

    // جلب التقييمات الموافق عليها
    const [reviews] = await db.query(`
      SELECT r.*, u.name AS user_name, u.avatar AS user_avatar
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = 1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [product.id]);

    // منتجات مشابهة
    const [relatedProducts] = await db.query(`
      SELECT id, name, name_ar, slug, price, sale_price, thumbnail, avg_rating
      FROM products
      WHERE category_id = ? AND id != ? AND is_active = 1
      LIMIT 4
    `, [product.category_id, product.id]);

    res.json({
      success: true,
      data: { product, reviews, relatedProducts }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في جلب المنتج' });
  }
};

/**
 * إنشاء منتج جديد (Admin)
 * POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const {
      name, name_ar, description, description_ar,
      price, sale_price, sku, stock, low_stock_alert,
      category_id, is_active, is_featured, weight,
      tags, meta_title, meta_description
    } = req.body;

    // إنشاء slug من الاسم
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();

    const [result] = await db.query(`
      INSERT INTO products (
        name, name_ar, slug, description, description_ar,
        price, sale_price, sku, stock, low_stock_alert,
        category_id, is_active, is_featured, weight,
        tags, meta_title, meta_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, name_ar, slug, description, description_ar,
      price, sale_price || null, sku || null,
      stock || 0, low_stock_alert || 5,
      category_id || null,
      is_active !== false ? 1 : 0,
      is_featured ? 1 : 0,
      weight || null,
      tags ? JSON.stringify(tags) : null,
      meta_title || null, meta_description || null
    ]);

    const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المنتج بنجاح',
      data: { product: newProduct[0] }
    });

  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'كود المنتج (SKU) مستخدم مسبقاً'
      });
    }
    res.status(500).json({ success: false, message: 'حدث خطأ في إنشاء المنتج' });
  }
};

/**
 * تعديل منتج (Admin)
 * PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    const {
      name, name_ar, description, description_ar,
      price, sale_price, sku, stock, low_stock_alert,
      category_id, is_active, is_featured, weight,
      tags, meta_title, meta_description, thumbnail
    } = req.body;

    await db.query(`
      UPDATE products SET
        name = COALESCE(?, name),
        name_ar = COALESCE(?, name_ar),
        description = COALESCE(?, description),
        description_ar = COALESCE(?, description_ar),
        price = COALESCE(?, price),
        sale_price = ?,
        sku = COALESCE(?, sku),
        stock = COALESCE(?, stock),
        low_stock_alert = COALESCE(?, low_stock_alert),
        category_id = COALESCE(?, category_id),
        is_active = COALESCE(?, is_active),
        is_featured = COALESCE(?, is_featured),
        weight = ?,
        tags = COALESCE(?, tags),
        meta_title = ?,
        meta_description = ?,
        thumbnail = COALESCE(?, thumbnail)
      WHERE id = ?
    `, [
      name, name_ar, description, description_ar,
      price, sale_price || null, sku,
      stock, low_stock_alert, category_id,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      weight || null,
      tags ? JSON.stringify(tags) : null,
      meta_title || null, meta_description || null,
      thumbnail, id
    ]);

    const [updatedProduct] = await db.query('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'تم تعديل المنتج بنجاح',
      data: { product: updatedProduct[0] }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في تعديل المنتج' });
  }
};

/**
 * حذف منتج (Admin)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }

    // حذف ناعم - تعطيل المنتج بدل حذفه فعلياً لحماية البيانات التاريخية
    await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'تم حذف المنتج بنجاح'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في حذف المنتج' });
  }
};

/**
 * تحديث صورة المنتج الرئيسية
 * PATCH /api/products/:id/thumbnail
 */
const updateThumbnail = async (req, res) => {
  try {
    const { id } = req.params;
    const { thumbnail } = req.body;

    await db.query('UPDATE products SET thumbnail = ? WHERE id = ?', [thumbnail, id]);

    res.json({ success: true, message: 'تم تحديث الصورة' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث الصورة' });
  }
};

module.exports = {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, updateThumbnail
};
