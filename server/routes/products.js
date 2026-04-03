const express = require('express');
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProduct } = require('../middleware/upload');
const cacheData = require('../middleware/cache');

const router = express.Router();

router.get('/', cacheData(3600, 'products'), getProducts);
router.get('/:id', cacheData(3600, 'products'), getProduct);

router.post('/', protect, authorize('admin'), uploadProduct.array('images', 10), createProduct);
router.put('/:id', protect, authorize('admin'), uploadProduct.array('images', 10), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
