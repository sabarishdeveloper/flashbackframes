const Product = require('../models/Product');
const { cloudinary } = require('../middleware/upload');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 });

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const cached = cache.get("products");
        if (cached) {
            return res.status(200).json({
                success: true,
                count: cached.length,
                data: cached
            });
        }

        const products = await Product.find().lean();
        cache.set("products", products);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        console.log('Create Product Request Body:', req.body);
        console.log('Create Product Files:', req.files);

        const productData = { ...req.body };

        if (req.files && req.files.length > 0) {
            productData.images = req.files.map(file => file.path);
        }

        // Options mapping if sent as string
        if (productData.options && typeof productData.options === 'string') {
            try {
                productData.options = JSON.parse(productData.options);
            } catch (e) {
                console.error('Error parsing options:', e);
                // If it fails to parse, we might want to set it to an empty object or delete it
                delete productData.options;
            }
        }

        // Parse materialPrices
        if (productData.materialPrices && typeof productData.materialPrices === 'string') {
            try {
                productData.materialPrices = JSON.parse(productData.materialPrices);
            } catch (e) {
                console.error('Error parsing materialPrices:', e);
                delete productData.materialPrices;
            }
        }

        // Parse useGlobalPricing
        if (productData.useGlobalPricing !== undefined) {
            productData.useGlobalPricing = productData.useGlobalPricing === 'true' || productData.useGlobalPricing === true;
        }

        // Parse isFeatured
        if (productData.isFeatured !== undefined) {
            productData.isFeatured = productData.isFeatured === 'true' || productData.isFeatured === true;
        }

        const product = await Product.create(productData);
        cache.del("products");
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        console.error('Create Product Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Server Error' });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        const productData = { ...req.body };

        if (req.files && req.files.length > 0) {
            productData.images = req.files.map(file => file.path);
        }

        // Options mapping if sent as string
        if (productData.options && typeof productData.options === 'string') {
            try {
                productData.options = JSON.parse(productData.options);
            } catch (e) {
                console.error('Error parsing options:', e);
                delete productData.options;
            }
        }

        // Parse materialPrices
        if (productData.materialPrices && typeof productData.materialPrices === 'string') {
            try {
                productData.materialPrices = JSON.parse(productData.materialPrices);
            } catch (e) {
                console.error('Error parsing materialPrices:', e);
                delete productData.materialPrices;
            }
        }

        // Parse useGlobalPricing
        if (productData.useGlobalPricing !== undefined) {
            productData.useGlobalPricing = productData.useGlobalPricing === 'true' || productData.useGlobalPricing === true;
        }

        // Parse isFeatured
        if (productData.isFeatured !== undefined) {
            productData.isFeatured = productData.isFeatured === 'true' || productData.isFeatured === true;
        }

        product = await Product.findByIdAndUpdate(req.params.id, productData, {
            new: true,
            runValidators: true
        });

        cache.del("products");

        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Update Product Error:', error);
        res.status(500).json({ success: false, error: error.message || 'Server Error' });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        // Delete images from cloudinary
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map(imgUrl => {
                // Extract public_id from URL
                // Example URL: https://res.cloudinary.com/cloudname/image/upload/v1234567/folder/public_id.jpg
                const urlParts = imgUrl.split('/');
                const fileName = urlParts[urlParts.length - 1].split('.')[0];
                const folderName = urlParts[urlParts.length - 2];
                const publicId = `flashback_frames/products/${fileName}`;
                return cloudinary.uploader.destroy(publicId);
            });
            await Promise.all(deletePromises);
        }

        await product.deleteOne();
        cache.del("products");
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
