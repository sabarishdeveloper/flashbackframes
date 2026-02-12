const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    customerName: {
        type: String,
        required: [true, 'Please add a customer name'],
    },
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number'],
    },
    address: {
        type: String,
        required: [true, 'Please add an address'],
    },
    email: {
        type: String,
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        productName: String,
        productPrice: Number,
        size: String,
        material: String,
        quantity: {
            type: Number,
            default: 1,
        },
        uploadedImage: {
            type: String,
            required: true
        }
    }],
    // Keep these for backward compatibility during migration
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    productDetails: {
        size: String,
        material: String,
        quantity: Number
    },
    uploadedImage: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Received', 'In Design', 'Printing', 'Ready', 'Delivered', 'Cancelled'],
        default: 'Received',
    },
    totalPrice: {
        type: Number,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending',
    },
    razorpayOrderId: {
        type: String,
    },
    razorpayPaymentId: {
        type: String,
    },
    paymentMethod: {
        type: String,
        enum: ['Prepaid', 'COD'],
        default: 'Prepaid',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
