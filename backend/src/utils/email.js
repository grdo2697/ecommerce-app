/**
 * Email Utility
 * إرسال الإيميلات باستخدام Nodemailer
 */

const nodemailer = require('nodemailer');

// إنشاء transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true لـ port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * إرسال إيميل
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER) {
    console.log('📧 Email not configured. Skipping email send.');
    console.log(`   To: ${to}\n   Subject: ${subject}`);
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'متجري'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html: html || `<p>${text}</p>`,
    text: text || html?.replace(/<[^>]*>/g, '') // نص بديل بدون HTML
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✉️ Email sent:', info.messageId);
  return info;
};

module.exports = { sendEmail };
