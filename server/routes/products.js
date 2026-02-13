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

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

router.post('/', protect, authorize('admin'), uploadProduct.array('images', 10), createProduct);
router.put('/:id', protect, authorize('admin'), uploadProduct.array('images', 10), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
