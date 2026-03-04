const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Please add a coupon code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        required: [true, 'Please specify discount type'],
        enum: ['flat', 'percentage'],
        default: 'flat'
    },
    discountValue: {
        type: Number,
        required: [true, 'Please add a discount value']
    },
    minOrderValue: {
        type: Number,
        default: 0
    },
    maxDiscountAmount: {
        type: Number,
        default: 0 // For percentage type
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Coupon', couponSchema);
