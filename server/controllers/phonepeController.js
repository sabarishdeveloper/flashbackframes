const axios = require('axios');
const crypto = require('crypto');
const phonepeConfig = require('../config/phonepe');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Initiate PhonePe Payment
// @route   POST /api/payment/phonepe/initiate
// @access  Public
exports.initiatePhonePePayment = async (req, res) => {
    try {
        const {
            customerName,
            mobile,
            address,
            productId,
            productDetails,
            amount
        } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload an image' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Parse product details if it's a string
        const parsedProductDetails = typeof productDetails === 'string' ? JSON.parse(productDetails) : productDetails;

        // Generate unique Order ID and Transaction ID
        const orderId = `FF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
        const merchantTransactionId = `MT-${Date.now()}`;

        // Create Pending Order in DB
        const order = await Order.create({
            orderId,
            customerName,
            mobile,
            address,
            productId,
            productDetails: parsedProductDetails,
            uploadedImage: req.file.path,
            totalPrice: amount,
            paymentStatus: 'Pending',
            paymentMethod: 'Prepaid',
            status: 'Received', // Or 'Pending Payment' if you add that status
            razorpayOrderId: merchantTransactionId // Reusing field or we can add new one
        });

        // PhonePe Payload
        const payload = {
            merchantId: phonepeConfig.merchantId,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: `MUID-${mobile}`,
            amount: Math.round(amount * 100), // amount in paise
            redirectUrl: `${process.env.FRONTEND_URL}/payment-status?merchantTransactionId=${merchantTransactionId}`,
            redirectMode: 'REDIRECT',
            callbackUrl: `${process.env.BACKEND_URL}/api/payment/phonepe/callback`,
            mobileNumber: mobile,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const checksum = crypto
            .createHash('sha256')
            .update(base64Payload + '/pg/v1/pay' + phonepeConfig.saltKey)
            .digest('hex') + '###' + phonepeConfig.saltIndex;

        const options = {
            method: 'POST',
            url: `${phonepeConfig.apiEndpoint}/pg/v1/pay`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: base64Payload
            }
        };

        const response = await axios.request(options);

        if (response.data.success) {
            res.status(200).json({
                success: true,
                redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
                merchantTransactionId: merchantTransactionId
            });
        } else {
            res.status(500).json({ success: false, error: 'PhonePe payment initiation failed' });
        }
    } catch (error) {
        console.error('PhonePe Initiation Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    PhonePe Callback (S2S)
// @route   POST /api/payment/phonepe/callback
// @access  Public
exports.phonePeCallback = async (req, res) => {
    try {
        const { response } = req.body;
        const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());

        if (decodedResponse.success && decodedResponse.code === 'PAYMENT_SUCCESS') {
            const merchantTransactionId = decodedResponse.data.merchantTransactionId;

            // Update order status
            const order = await Order.findOne({ razorpayOrderId: merchantTransactionId });
            if (order) {
                order.paymentStatus = 'Paid';
                await order.save();
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('PhonePe Callback Error:', error);
        res.status(500).send('Error');
    }
};

// @desc    Check PhonePe Payment Status
// @route   GET /api/payment/phonepe/status/:merchantTransactionId
// @access  Public
exports.checkPhonePeStatus = async (req, res) => {
    try {
        const { merchantTransactionId } = req.params;

        const checksum = crypto
            .createHash('sha256')
            .update(`/pg/v1/status/${phonepeConfig.merchantId}/${merchantTransactionId}` + phonepeConfig.saltKey)
            .digest('hex') + '###' + phonepeConfig.saltIndex;

        const options = {
            method: 'GET',
            url: `${phonepeConfig.apiEndpoint}/pg/v1/status/${phonepeConfig.merchantId}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': phonepeConfig.merchantId
            }
        };

        const response = await axios.request(options);

        if (response.data.success && response.data.code === 'PAYMENT_SUCCESS') {
            // Confirm order is paid in DB
            const order = await Order.findOne({ razorpayOrderId: merchantTransactionId });
            if (order && order.paymentStatus !== 'Paid') {
                order.paymentStatus = 'Paid';
                await order.save();
            }

            res.status(200).json({
                success: true,
                status: 'Paid',
                order: order
            });
        } else {
            res.status(200).json({
                success: false,
                status: response.data.code,
                message: response.data.message
            });
        }
    } catch (error) {
        console.error('PhonePe Status Check Error:', error.response?.data || error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};
