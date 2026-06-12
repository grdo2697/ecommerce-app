const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, stripeWebhook, getOrderPayments } = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Webhook يحتاج raw body - مضبوط في server.js
router.post('/webhook', stripeWebhook);

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/confirm', authenticate, confirmPayment);
router.get('/order/:orderId', authenticate, getOrderPayments);

module.exports = router;
