/**
 * Payment Controller
 * تكامل Stripe للدفع الإلكتروني
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/database');

/**
 * إنشاء Payment Intent مع Stripe
 * POST /api/payments/create-intent
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', items } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ غير صالح'
      });
    }

    // إنشاء Payment Intent في Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe يعمل بالسنتات
      currency,
      automatic_payment_methods: {
        enabled: true, // يدعم Visa, MasterCard, والمزيد تلقائياً
      },
      metadata: {
        user_id: req.user.id.toString(),
        user_email: req.user.email
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء عملية الدفع'
    });
  }
};

/**
 * تأكيد الدفع وحفظه في قاعدة البيانات
 * POST /api/payments/confirm
 */
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // التحقق من حالة الدفع مع Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `فشل الدفع: ${paymentIntent.status}`
      });
    }

    const amount = paymentIntent.amount / 100;

    // حفظ معلومات الدفع
    await db.query(`
      INSERT INTO payments (
        order_id, stripe_payment_intent, amount, currency,
        status, payment_method_type, metadata
      ) VALUES (?, ?, ?, ?, 'succeeded', ?, ?)
    `, [
      orderId, paymentIntentId, amount,
      paymentIntent.currency,
      paymentIntent.payment_method_types?.[0] || 'card',
      JSON.stringify(paymentIntent.metadata)
    ]);

    // تحديث حالة الدفع في الطلب
    await db.query(
      "UPDATE orders SET payment_status = 'paid' WHERE id = ?",
      [orderId]
    );

    res.json({
      success: true,
      message: 'تم تأكيد الدفع بنجاح',
      data: { amount, currency: paymentIntent.currency }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تأكيد الدفع'
    });
  }
};

/**
 * Stripe Webhook - استقبال أحداث Stripe
 * POST /api/payments/webhook
 */
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // معالجة أحداث Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('✅ Payment succeeded:', event.data.object.id);
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      console.error('❌ Payment failed:', failedIntent.id);
      // تحديث حالة الدفع الفاشل في قاعدة البيانات
      await db.query(
        `UPDATE payments SET status = 'failed', error_message = ? WHERE stripe_payment_intent = ?`,
        [failedIntent.last_payment_error?.message, failedIntent.id]
      ).catch(console.error);
      break;

    case 'charge.refunded':
      console.log('🔄 Charge refunded:', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

/**
 * جلب سجل مدفوعات طلب
 * GET /api/payments/order/:orderId
 */
const getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;

    const [payments] = await db.query(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );

    res.json({ success: true, data: { payments } });

  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب المدفوعات' });
  }
};

module.exports = { createPaymentIntent, confirmPayment, stripeWebhook, getOrderPayments };
