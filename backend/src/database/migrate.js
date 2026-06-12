/**
 * Database Migration Script
 * ينشئ جميع جداول قاعدة البيانات
 * شغّل: node src/database/migrate.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  let connection;

  try {
    // اتصال بدون database لإنشائها أولاً
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      charset: 'utf8mb4'
    });

    console.log('🔄 Starting database migration...\n');

    // إنشاء قاعدة البيانات
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    // ============================
    // 1. جدول المستخدمين
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name          VARCHAR(100) NOT NULL,
        email         VARCHAR(150) NOT NULL UNIQUE,
        password      VARCHAR(255) NOT NULL,
        role          ENUM('admin','user') DEFAULT 'user',
        avatar        VARCHAR(500),
        phone         VARCHAR(20),
        is_active     BOOLEAN DEFAULT TRUE,
        reset_token   VARCHAR(255),
        reset_expires DATETIME,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: users');

    // ============================
    // 2. جدول التصنيفات
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        name_ar     VARCHAR(100),
        slug        VARCHAR(150) NOT NULL UNIQUE,
        description TEXT,
        image       VARCHAR(500),
        parent_id   INT UNSIGNED,
        is_active   BOOLEAN DEFAULT TRUE,
        sort_order  INT DEFAULT 0,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_slug (slug),
        INDEX idx_parent (parent_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: categories');

    // ============================
    // 3. جدول المنتجات
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name            VARCHAR(200) NOT NULL,
        name_ar         VARCHAR(200),
        slug            VARCHAR(250) NOT NULL UNIQUE,
        description     TEXT,
        description_ar  TEXT,
        price           DECIMAL(10,2) NOT NULL,
        sale_price      DECIMAL(10,2),
        cost_price      DECIMAL(10,2),
        sku             VARCHAR(100) UNIQUE,
        stock           INT UNSIGNED DEFAULT 0,
        low_stock_alert INT UNSIGNED DEFAULT 5,
        category_id     INT UNSIGNED,
        images          JSON,
        thumbnail       VARCHAR(500),
        is_active       BOOLEAN DEFAULT TRUE,
        is_featured     BOOLEAN DEFAULT FALSE,
        weight          DECIMAL(8,3),
        dimensions      JSON,
        tags            JSON,
        meta_title      VARCHAR(200),
        meta_description VARCHAR(500),
        total_sold      INT UNSIGNED DEFAULT 0,
        avg_rating      DECIMAL(3,2) DEFAULT 0,
        review_count    INT UNSIGNED DEFAULT 0,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_slug (slug),
        INDEX idx_category (category_id),
        INDEX idx_price (price),
        INDEX idx_active (is_active),
        FULLTEXT idx_search (name, name_ar, description)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: products');

    // ============================
    // 4. جدول العناوين
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id     INT UNSIGNED NOT NULL,
        title       VARCHAR(100),
        full_name   VARCHAR(150) NOT NULL,
        phone       VARCHAR(20) NOT NULL,
        country     VARCHAR(100) NOT NULL,
        city        VARCHAR(100) NOT NULL,
        state       VARCHAR(100),
        address     TEXT NOT NULL,
        postal_code VARCHAR(20),
        is_default  BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: addresses');

    // ============================
    // 5. جدول الطلبات
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_number      VARCHAR(50) NOT NULL UNIQUE,
        user_id           INT UNSIGNED NOT NULL,
        status            ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
        payment_status    ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
        payment_method    VARCHAR(50),
        subtotal          DECIMAL(10,2) NOT NULL,
        discount          DECIMAL(10,2) DEFAULT 0,
        shipping_cost     DECIMAL(10,2) DEFAULT 0,
        tax               DECIMAL(10,2) DEFAULT 0,
        total             DECIMAL(10,2) NOT NULL,
        currency          VARCHAR(10) DEFAULT 'USD',
        shipping_address  JSON NOT NULL,
        notes             TEXT,
        admin_notes       TEXT,
        shipped_at        DATETIME,
        delivered_at      DATETIME,
        created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_user (user_id),
        INDEX idx_status (status),
        INDEX idx_order_number (order_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: orders');

    // ============================
    // 6. جدول تفاصيل الطلب
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id    INT UNSIGNED NOT NULL,
        product_id  INT UNSIGNED NOT NULL,
        product_name VARCHAR(200) NOT NULL,
        product_image VARCHAR(500),
        quantity    INT UNSIGNED NOT NULL,
        unit_price  DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
        INDEX idx_order (order_id),
        INDEX idx_product (product_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: order_items');

    // ============================
    // 7. جدول المدفوعات
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id              INT UNSIGNED NOT NULL,
        stripe_payment_intent VARCHAR(200),
        stripe_charge_id      VARCHAR(200),
        amount                DECIMAL(10,2) NOT NULL,
        currency              VARCHAR(10) DEFAULT 'USD',
        status                ENUM('pending','succeeded','failed','refunded') DEFAULT 'pending',
        payment_method_type   VARCHAR(50),
        receipt_url           VARCHAR(500),
        error_message         TEXT,
        metadata              JSON,
        created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        INDEX idx_order (order_id),
        INDEX idx_stripe_pi (stripe_payment_intent)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: payments');

    // ============================
    // 8. جدول التقييمات
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        product_id  INT UNSIGNED NOT NULL,
        user_id     INT UNSIGNED NOT NULL,
        rating      TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
        title       VARCHAR(200),
        comment     TEXT,
        is_approved BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_review (product_id, user_id),
        INDEX idx_product (product_id),
        INDEX idx_approved (is_approved)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: reviews');

    // ============================
    // 9. جدول قائمة الرغبات
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS wishlists (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id     INT UNSIGNED NOT NULL,
        product_id  INT UNSIGNED NOT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_wishlist (user_id, product_id),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: wishlists');

    // ============================
    // 10. جدول كوبونات الخصم
    // ============================
    await connection.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        code            VARCHAR(50) NOT NULL UNIQUE,
        type            ENUM('percentage','fixed') DEFAULT 'percentage',
        value           DECIMAL(10,2) NOT NULL,
        min_order       DECIMAL(10,2) DEFAULT 0,
        max_uses        INT UNSIGNED,
        used_count      INT UNSIGNED DEFAULT 0,
        user_id         INT UNSIGNED,
        expires_at      DATETIME,
        is_active       BOOLEAN DEFAULT TRUE,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table: coupons');

    console.log('\n🎉 Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
