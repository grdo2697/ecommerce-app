/**
 * Auth Controller
 * تسجيل الدخول، إنشاء الحساب، استعادة كلمة المرور
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { sendEmail } = require('../utils/email');

/**
 * توليد JWT Token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * تسجيل مستخدم جديد
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // التحقق من عدم تكرار الإيميل
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: 'هذا البريد الإلكتروني مسجل مسبقاً',
        errors: { email: 'البريد الإلكتروني مستخدم بالفعل' }
      });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 12);

    // إنشاء المستخدم
    const [result] = await db.query(
      `INSERT INTO users (name, email, password, phone, role, is_active)
       VALUES (?, ?, ?, ?, 'user', 1)`,
      [name, email.toLowerCase(), hashedPassword, phone || null]
    );

    const userId = result.insertId;

    // توليد التوكن
    const token = generateToken(userId, 'user');

    // إرسال إيميل ترحيب
    try {
      await sendEmail({
        to: email,
        subject: 'مرحباً بك في متجرنا! 🎉',
        html: `
          <h2>مرحباً ${name}!</h2>
          <p>شكراً لتسجيلك في متجرنا. يسعدنا انضمامك إلينا.</p>
          <p>يمكنك الآن تسوق أفضل المنتجات بأسعار مميزة.</p>
        `
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      data: {
        token,
        user: {
          id: userId,
          name,
          email: email.toLowerCase(),
          role: 'user',
          avatar: null
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء إنشاء الحساب'
    });
  }
};

/**
 * تسجيل الدخول
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // جلب المستخدم من قاعدة البيانات
    const [users] = await db.query(
      'SELECT id, name, email, password, role, is_active, avatar FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'تم تعليق هذا الحساب، تواصل مع الدعم'
      });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
    }

    // توليد التوكن
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول'
    });
  }
};

/**
 * طلب استعادة كلمة المرور
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.query(
      'SELECT id, name, email FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    // نرد بنفس الرسالة سواء وُجد الإيميل أم لا (أمان)
    const successMessage = 'إذا كان البريد مسجلاً، ستصلك رسالة استعادة كلمة المرور';

    if (!users.length) {
      return res.json({ success: true, message: successMessage });
    }

    const user = users[0];

    // توليد reset token آمن
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة

    await db.query(
      'UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?',
      [resetToken, resetExpires, user.id]
    );

    // إرسال إيميل الاستعادة
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'استعادة كلمة المرور',
      html: `
        <h2>استعادة كلمة المرور</h2>
        <p>مرحباً ${user.name}،</p>
        <p>تلقينا طلباً لإعادة تعيين كلمة مرورك. اضغط على الزر أدناه:</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          padding: 12px 24px;
          background: #6366f1;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
        ">إعادة تعيين كلمة المرور</a>
        <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
        <p>إذا لم تطلب هذا، تجاهل هذا البريد.</p>
      `
    });

    res.json({ success: true, message: successMessage });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ، حاول مرة أخرى'
    });
  }
};

/**
 * إعادة تعيين كلمة المرور
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const [users] = await db.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_expires > NOW()',
      [token]
    );

    if (!users.length) {
      return res.status(400).json({
        success: false,
        message: 'رابط الاستعادة غير صالح أو منتهي الصلاحية'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?',
      [hashedPassword, users[0].id]
    );

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ، حاول مرة أخرى'
    });
  }
};

/**
 * جلب بيانات المستخدم الحالي
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: { user: users[0] }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'حدث خطأ' });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getMe };
