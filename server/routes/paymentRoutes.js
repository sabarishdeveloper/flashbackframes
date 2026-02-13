const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, verifyAndCreateOrder } = require('../controllers/paymentController');
const { uploadOrder } = require('../middleware/upload');

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.post('/verify-and-create', uploadOrder.array('images'), verifyAndCreateOrder);

module.exports = router;
