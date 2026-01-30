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
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productDetails: {
        size: String,
        material: String,
        quantity: {
            type: Number,
            default: 1,
        }
    },
    uploadedImage: {
        type: String,
        required: [true, 'Please upload an image'],
    },
    status: {
        type: String,
        enum: ['Received', 'In Design', 'Printing', 'Ready', 'Delivered', 'Cancelled'],
        default: 'Received',
    },
    totalPrice: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
