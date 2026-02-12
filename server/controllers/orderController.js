const Order = require('../models/Order');
const Product = require('../models/Product');
const crypto = require('crypto');
const { cloudinary } = require('../middleware/upload');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const { customerName, mobile, address, email, paymentMethod, items: itemsJson } = req.body;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'Please upload images for all items' });
        }

        const items = typeof itemsJson === 'string' ? JSON.parse(itemsJson) : itemsJson;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, error: 'No items in order' });
        }

        if (req.files.length !== items.length) {
            return res.status(400).json({ success: false, error: `Expected ${items.length} images, but got ${req.files.length}` });
        }

        // Generate unique Order ID
        const orderId = `FF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        // Process items and calculate total
        let totalPrice = 0;
        const processedItems = items.map((item, index) => {
            const itemTotal = item.productPrice * item.quantity;
            totalPrice += itemTotal;
            return {
                ...item,
                uploadedImage: req.files[index].path
            };
        });

        const order = await Order.create({
            orderId,
            customerName,
            mobile,
            address,
            email,
            items: processedItems,
            totalPrice,
            paymentMethod: paymentMethod || 'Prepaid',
            status: 'Received'
        });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// ... existing code ...

exports.trackOrder = async (req, res) => {
    try {
        const { identifier } = req.params;

        // Search by orderId or mobile
        const order = await Order.findOne({
            $or: [
                { orderId: identifier },
                { mobile: identifier }
            ]
        }).populate('items.productId', 'name images');

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort('-createdAt').populate('productId', 'name');
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Received', 'In Design', 'Printing', 'Ready', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }
        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                if (item.uploadedImage) {
                    const urlParts = item.uploadedImage.split('/');
                    const fileName = urlParts[urlParts.length - 1].split('.')[0];
                    const publicId = `flashback_frames/orders/${fileName}`;
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        } else if (order.uploadedImage) {
            // Backward compatibility
            const urlParts = order.uploadedImage.split('/');
            const fileName = urlParts[urlParts.length - 1].split('.')[0];
            const publicId = `flashback_frames/orders/${fileName}`;
            await cloudinary.uploader.destroy(publicId);
        }

        await order.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.error('Delete Order Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
