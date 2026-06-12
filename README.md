# 🛒 متجر إلكتروني متكامل - E-Commerce Full Stack

مشروع تجارة إلكترونية احترافي ومتكامل بـ React + Node.js + MySQL

---

## 📁 هيكل المشروع

```
ecommerce-app/
├── frontend/          ← React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/     ← صفحات الموقع
│   │   ├── components/← المكونات
│   │   ├── layouts/   ← القوالب (رئيسي + أدمن)
│   │   ├── store/     ← Zustand (Auth + Cart)
│   │   └── services/  ← API calls
│   └── ...
└── backend/           ← Node.js + Express
    ├── server.js
    └── src/
        ├── controllers/
        ├── routes/
        ├── middleware/
        ├── database/
        └── utils/
```

---

## ⚡ متطلبات التشغيل

- Node.js 18+
- MySQL 8+
- npm أو yarn

---

## 🚀 خطوات التشغيل

### 1. إعداد قاعدة البيانات

```bash
# أنشئ ملف .env في مجلد backend
cd backend
cp .env.example .env
# عدّل .env وأدخل بيانات MySQL

# تشغيل الـ migrations (إنشاء الجداول)
npm run db:migrate

# إضافة بيانات تجريبية
npm run db:seed
```

### 2. تشغيل Backend

```bash
cd backend
npm install
npm run dev
# يعمل على http://localhost:5000
```

### 3. تشغيل Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# يعمل على http://localhost:5173
```

---

## 🔑 بيانات الدخول التجريبية

| الدور | البريد الإلكتروني | كلمة المرور |
|-------|----------------|------------|
| مدير | admin@store.com | Admin@123 |
| مستخدم | user@test.com | User@123 |

**كوبونات خصم:**
- `WELCOME10` ← خصم 10% على طلبات فوق $50
- `SAVE20` ← خصم 20% على طلبات فوق $100
- `FLAT50` ← خصم $50 على طلبات فوق $200

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

### Products
```
GET    /api/products          ← جلب المنتجات (فلترة + بحث + pagination)
GET    /api/products/:slug    ← تفاصيل منتج
POST   /api/products          ← إنشاء (Admin)
PUT    /api/products/:id      ← تعديل (Admin)
DELETE /api/products/:id      ← حذف (Admin)
```

### Categories
```
GET    /api/categories
POST   /api/categories        ← (Admin)
PUT    /api/categories/:id    ← (Admin)
DELETE /api/categories/:id    ← (Admin)
```

### Orders
```
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status ← (Admin)
```

### Payments (Stripe)
```
POST   /api/payments/create-intent
POST   /api/payments/confirm
POST   /api/payments/webhook
```

### Wishlist
```
GET    /api/wishlist
POST   /api/wishlist/toggle
```

### Reviews
```
POST   /api/reviews
GET    /api/reviews/pending   ← (Admin)
PATCH  /api/reviews/:id/approve ← (Admin)
```

### Admin
```
GET    /api/admin/dashboard
GET    /api/admin/users
PATCH  /api/admin/users/:id/toggle-status
GET    /api/admin/orders
```

### Upload
```
POST   /api/upload/product-image
POST   /api/upload/product-images
POST   /api/upload/avatar
```

---

## 💳 إعداد Stripe

1. أنشئ حساباً على [stripe.com](https://stripe.com)
2. احصل على مفاتيح الـ API من Dashboard
3. أضفها في ملف `backend/.env`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
4. أضف المفتاح العام في `frontend/.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📧 إعداد البريد الإلكتروني (Gmail)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password  ← App Password من Google
EMAIL_FROM=noreply@yourstore.com
```

---

## 🌍 النشر على الاستضافة

### Backend (مثال: Railway / Render / VPS)

```bash
# على الخادم
cd backend
npm install --production
NODE_ENV=production node server.js

# أو باستخدام PM2 (موصى به)
npm install -g pm2
pm2 start server.js --name "ecommerce-api"
pm2 startup
pm2 save
```

### Frontend (مثال: Vercel / Netlify)

```bash
cd frontend
npm run build
# ارفع مجلد dist/ على Vercel/Netlify

# أو على VPS مع Nginx:
# انسخ dist/ إلى /var/www/html
```

### إعداد Nginx (VPS)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/ecommerce/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 🔒 ملاحظات الأمان

- ✅ JWT Authentication
- ✅ bcrypt لتشفير كلمات المرور (salt rounds: 12)
- ✅ Helmet.js لحماية HTTP headers
- ✅ Rate Limiting (100 طلب/15 دقيقة، 10 للمصادقة)
- ✅ CORS محدود بنطاق الفرونت إند
- ✅ XSS Protection
- ✅ SQL Injection Protection (Parameterized Queries)
- ✅ Input Validation (express-validator)
- ✅ File Upload Validation (نوع + حجم)

---

## 🛠 التقنيات المستخدمة

### Frontend
- React 18 + Vite
- Tailwind CSS
- Zustand (State Management)
- React Router v6
- Axios
- React Hot Toast
- Recharts (الرسوم البيانية)
- Lucide React (الأيقونات)

### Backend
- Node.js + Express.js
- MySQL2 (Connection Pool)
- JWT + bcryptjs
- Multer (رفع الملفات)
- Nodemailer (البريد الإلكتروني)
- Stripe (الدفع)
- Helmet + express-rate-limit

---

## 📞 الدعم

للاستفسارات والمساعدة: support@mystore.com
