/**
 * Database Connection Pool
 * يستخدم mysql2 مع promise-based API
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// إنشاء connection pool بدل connection واحد لأداء أفضل
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,       // أقصى عدد connections متزامنة
  queueLimit: 0,
  timezone: '+00:00',        // UTC timezone
  charset: 'utf8mb4',        // دعم كامل للعربية والـ emoji
  decimalNumbers: true
});

// اختبار الاتصال عند بدء التشغيل
pool.getConnection()
  .then(conn => {
    console.log('✅ Database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });
  

module.exports = pool;
