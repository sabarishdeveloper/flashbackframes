const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');

const Product = require('../models/Product');

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Public
exports.createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, error: 'Amount is required' });
        }

        const options = {
            amount: Math.round(amount * 100), // convert INR to paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        if (!razorpayOrder) {
            return res.status(500).json({ success: false, error: 'Razorpay order creation failed' });
        }

        res.status(200).json({
            success: true,
            order: razorpayOrder
        });
    } catch (error) {
        console.error('Razorpay Order Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Verify Razorpay Payment and Create Order
// @route   POST /api/payment/verify-and-create
// @access  Public
exports.verifyAndCreateOrder = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            customerName,
            mobile,
            address,
            productId,
            productDetails,
            paymentMethod
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Required payment details missing' });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Invalid signature, payment verification failed' });
        }

        // Check if image exists (uploaded via multer)
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload an image' });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Generate unique Order ID
        const orderId = `FF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Parse product details if it's a string
        const parsedProductDetails = typeof productDetails === 'string' ? JSON.parse(productDetails) : productDetails;

        // Calculate total price
        const totalPrice = product.price * (parsedProductDetails?.quantity || 1);

        const order = await Order.create({
            orderId,
            customerName,
            mobile,
            address,
            productId,
            productDetails: parsedProductDetails,
            uploadedImage: req.file.path,
            totalPrice,
            paymentStatus: 'Paid',
            paymentMethod: paymentMethod || 'Prepaid',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            status: 'Received'
        });

        res.status(201).json({
            success: true,
            message: 'Payment verified and order created successfully',
            data: order
        });
    } catch (error) {
        console.error('Payment Verification & Creation Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Verify Razorpay Payment (for existing orders if any)
// @route   POST /api/payment/verify
// @access  Public
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            internalOrderId
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !internalOrderId) {
            return res.status(400).json({ success: false, error: 'Required payment details missing' });
        }

        // Generate signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update order in database
            const order = await Order.findById(internalOrderId);

            if (!order) {
                return res.status(404).json({ success: false, error: 'Internal Order not found' });
            }

            order.paymentStatus = 'Paid';
            order.razorpayOrderId = razorpay_order_id;
            order.razorpayPaymentId = razorpay_payment_id;
            order.status = 'Received'; // Ensure status is set to Received on successful payment if it wasn't already

            await order.save();

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: order
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'Invalid signature, payment verification failed'
            });
        }
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
