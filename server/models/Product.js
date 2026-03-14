const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Photo Frames', 'Canvas Prints', 'Custom Gifts', 'Collage Frames'],
    },
    price: {
        type: Number,
        default: 0,
    },
    materialPrices: {
        mat: { type: Number, default: 0 },
        glossy: { type: Number, default: 0 },
        glitter: { type: Number, default: 0 }
    },
    images: [String],
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    options: {
        sizes: [String],
        materials: [String],
    },
    useGlobalPricing: {
        type: Boolean,
        default: false,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', productSchema);
