const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, verifyAndCreateOrder } = require('../controllers/paymentController');
const { initiatePhonePePayment, phonePeCallback, checkPhonePeStatus } = require('../controllers/phonepeController');
const { uploadOrder } = require('../middleware/upload');

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.post('/verify-and-create', uploadOrder.array('images'), verifyAndCreateOrder);

// PhonePe Routes
router.post('/phonepe/initiate', uploadOrder.array('images'), initiatePhonePePayment);
router.post('/phonepe/callback', phonePeCallback);
router.get('/phonepe/status/:merchantTransactionId', checkPhonePeStatus);

module.exports = router;
