const express = require('express');
const {
    createOrder,
    trackOrder,
    getOrders,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { uploadOrder } = require('../middleware/upload');

const router = express.Router();

router.post('/', uploadOrder.array('images'), createOrder);
router.get('/track/:identifier', trackOrder);

router.get('/', protect, authorize('admin'), getOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

module.exports = router;
