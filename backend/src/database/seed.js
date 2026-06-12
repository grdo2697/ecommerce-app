/**
 * Database Seed Script
 * يضيف بيانات تجريبية لقاعدة البيانات
 * شغّل: node src/database/seed.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seed() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    });

    console.log('🌱 Seeding database...\n');

    // ============================
    // Admin User
    // ============================
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    await connection.query(`
      INSERT IGNORE INTO users (name, email, password, role, is_active)
      VALUES 
        ('مدير المتجر', 'admin@store.com', ?, 'admin', 1),
        ('أحمد محمد', 'user@test.com', ?, 'user', 1)
    `, [adminPassword, await bcrypt.hash('User@123', 12)]);
    console.log('✅ Users seeded');

    // ============================
    // Categories
    // ============================
    await connection.query(`
      INSERT IGNORE INTO categories (name, name_ar, slug, description, is_active)
      VALUES 
        ('Electronics', 'إلكترونيات', 'electronics', 'أجهزة إلكترونية وتقنية', 1),
        ('Clothing', 'ملابس', 'clothing', 'ملابس رجالية ونسائية', 1),
        ('Books', 'كتب', 'books', 'كتب وروايات', 1),
        ('Home & Garden', 'المنزل والحديقة', 'home-garden', 'مستلزمات المنزل', 1),
        ('Sports', 'رياضة', 'sports', 'مستلزمات رياضية', 1),
        ('Beauty', 'جمال وعناية', 'beauty', 'منتجات العناية والجمال', 1)
    `);
    console.log('✅ Categories seeded');

    // ============================
    // Products
    // ============================
    const products = [
      {
        name: 'iPhone 15 Pro',
        name_ar: 'آيفون 15 برو',
        slug: 'iphone-15-pro',
        description: 'Latest iPhone with A17 Pro chip and titanium design',
        description_ar: 'أحدث آيفون بشريحة A17 Pro وتصميم من التيتانيوم',
        price: 999.99,
        sale_price: 949.99,
        sku: 'IPHONE15PRO',
        stock: 50,
        category_id: 1,
        thumbnail: '/uploads/products/iphone15pro.jpg',
        is_featured: 1
      },
      {
        name: 'Samsung Galaxy S24',
        name_ar: 'سامسونج جالاكسي S24',
        slug: 'samsung-galaxy-s24',
        description: 'Flagship Samsung phone with AI features',
        description_ar: 'هاتف سامسونج الرائد مع ميزات الذكاء الاصطناعي',
        price: 799.99,
        sale_price: null,
        sku: 'SAMSUNGS24',
        stock: 35,
        category_id: 1,
        thumbnail: '/uploads/products/galaxy-s24.jpg',
        is_featured: 1
      },
      {
        name: 'MacBook Pro 14"',
        name_ar: 'ماك بوك برو 14 إنش',
        slug: 'macbook-pro-14',
        description: 'Professional laptop with M3 Pro chip',
        description_ar: 'لابتوب احترافي بشريحة M3 Pro',
        price: 1999.99,
        sale_price: 1899.99,
        sku: 'MACBOOKPRO14',
        stock: 20,
        category_id: 1,
        thumbnail: '/uploads/products/macbook-pro.jpg',
        is_featured: 1
      },
      {
        name: 'Classic White T-Shirt',
        name_ar: 'تيشيرت أبيض كلاسيك',
        slug: 'classic-white-tshirt',
        description: '100% cotton comfortable t-shirt',
        description_ar: 'تيشيرت قطن 100% مريح',
        price: 29.99,
        sale_price: 19.99,
        sku: 'TSHIRT-WHITE',
        stock: 200,
        category_id: 2,
        thumbnail: '/uploads/products/tshirt-white.jpg',
        is_featured: 0
      },
      {
        name: 'Denim Jacket',
        name_ar: 'جاكيت جينز',
        slug: 'denim-jacket',
        description: 'Stylish denim jacket for all seasons',
        description_ar: 'جاكيت جينز أنيق لجميع الفصول',
        price: 79.99,
        sale_price: null,
        sku: 'DENIM-JACKET',
        stock: 80,
        category_id: 2,
        thumbnail: '/uploads/products/denim-jacket.jpg',
        is_featured: 0
      },
      {
        name: 'Yoga Mat Pro',
        name_ar: 'حصيرة يوغا برو',
        slug: 'yoga-mat-pro',
        description: 'Professional non-slip yoga mat 6mm thick',
        description_ar: 'حصيرة يوغا احترافية مضادة للانزلاق سمك 6 مم',
        price: 49.99,
        sale_price: 39.99,
        sku: 'YOGA-MAT',
        stock: 100,
        category_id: 5,
        thumbnail: '/uploads/products/yoga-mat.jpg',
        is_featured: 1
      }
    ];

    for (const product of products) {
      await connection.query(`
        INSERT IGNORE INTO products 
          (name, name_ar, slug, description, description_ar, price, sale_price, sku, stock, category_id, thumbnail, is_featured, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        product.name, product.name_ar, product.slug,
        product.description, product.description_ar,
        product.price, product.sale_price, product.sku,
        product.stock, product.category_id, product.thumbnail,
        product.is_featured
      ]);
    }
    console.log('✅ Products seeded');

    // ============================
    // Coupons
    // ============================
    await connection.query(`
      INSERT IGNORE INTO coupons (code, type, value, min_order, max_uses, is_active)
      VALUES 
        ('WELCOME10', 'percentage', 10, 50, 1000, 1),
        ('SAVE20', 'percentage', 20, 100, 500, 1),
        ('FLAT50', 'fixed', 50, 200, 200, 1)
    `);
    console.log('✅ Coupons seeded');

    console.log(`
🎉 Seed completed!

📧 Admin Login:
   Email:    admin@store.com
   Password: Admin@123

📧 User Login:
   Email:    user@test.com
   Password: User@123

🎫 Coupon Codes:
   WELCOME10 → 10% off orders above $50
   SAVE20    → 20% off orders above $100
   FLAT50    → $50 off orders above $200
    `);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
