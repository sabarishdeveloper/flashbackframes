const multer = require('multer');
const path = require('path');

// Storage for products
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products/');
    },
    filename: function (req, file, cb) {
        cb(null, `product_${Date.now()}${path.extname(file.originalname)}`);
    },
});

// Storage for orders
const orderStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/orders/');
    },
    filename: function (req, file, cb) {
        cb(null, `order_${Date.now()}${path.extname(file.originalname)}`);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Please upload an image file'), false);
    }
};

const uploadProduct = multer({
    storage: productStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter,
});

const uploadOrder = multer({
    storage: orderStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: fileFilter,
});

module.exports = { uploadProduct, uploadOrder };
