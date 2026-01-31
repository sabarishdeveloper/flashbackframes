const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
    api_key: process.env.CLOUDINARY_API_KEY?.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
});

// Storage for products
const productStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'flashback_frames/products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

// Storage for orders
const orderStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'flashback_frames/orders',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

// File filter (redundant but good to keep)
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

module.exports = { uploadProduct, uploadOrder, cloudinary };
