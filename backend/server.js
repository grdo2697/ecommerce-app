/**
 * ====================================
 * E-Commerce API Server
 * Node.js + Express + MySQL
 * ====================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// استيراد الـ routes
const authRoutes = require('./src/routes/auth.routes');
const productRoutes = require('./src/routes/product.routes');
const categoryRoutes = require('./src/routes/category.routes');
const orderRoutes = require('./src/routes/order.routes');
const userRoutes = require('./src/routes/user.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const reviewRoutes = require('./src/routes/review.routes');
const wishlistRoutes = require('./src/routes/wishlist.routes');
const adminRoutes = require('./src/routes/admin.routes');
const uploadRoutes = require('./src/routes/upload.routes');

const app = express();

// ============================
// Middleware للأمان
// ============================

// Helmet لحماية HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - السماح للفرونت إند بالتواصل مع الباك إند
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting - الحماية من هجمات الـ brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // 100 طلب كحد أقصى لكل IP
  message: { success: false, message: 'تجاوزت الحد المسموح من الطلبات، حاول مرة أخرى بعد 15 دقيقة' }
});
app.use('/api/', limiter);

// Rate limiting أشد لـ Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'محاولات تسجيل دخول كثيرة، حاول مرة أخرى بعد 15 دقيقة' }
});

// ============================
// Body Parsing Middleware
// ============================

// Stripe Webhook يحتاج raw body قبل JSON parsing
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================
// Static Files (الصور المرفوعة)
// ============================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================
// API Routes
// ============================
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// ============================
// Health Check Endpoint
// ============================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// ============================
// 404 Handler
// ============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار المطلوب غير موجود'
  });
});

// ============================
// Global Error Handler
// ============================
app.use((err, req, res, next) => {
  console.error('Global Error:', err);

  // Multer errors (رفع الملفات)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'حجم الملف كبير جداً، الحد الأقصى 5MB'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'حدث خطأ في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================
// Start Server
// ============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   🚀 E-Commerce Server Running     ║
  ║   Port: ${PORT}                       ║
  ║   Env:  ${process.env.NODE_ENV}            ║
  ╚════════════════════════════════════╝
  `);
});

module.exports = app;
