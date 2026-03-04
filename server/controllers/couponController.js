const Coupon = require('../models/Coupon');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: coupons
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, error: 'Coupon not found' });
        }
        await coupon.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
    try {
        const { code, orderValue } = req.body;

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ success: false, error: 'Invalid coupon code' });
        }

        // Check expiry
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ success: false, error: 'Coupon has expired' });
        }

        // Check min order value
        if (orderValue < coupon.minOrderValue) {
            return res.status(400).json({
                success: false,
                error: `Minimum order value for this coupon is ₹${coupon.minOrderValue}`
            });
        }

        let discountAmount = 0;
        if (coupon.discountType === 'flat') {
            discountAmount = coupon.discountValue;
        } else {
            discountAmount = (orderValue * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
