import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, CreditCard, Truck, CheckCircle2, Loader2 } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { orderAPI } from '../services/apiService';
import { toast } from 'sonner';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderDetails = location.state?.orderDetails;
    const uploadedFile = location.state?.file;

    const [formData, setFormData] = useState({
        customerName: '',
        mobile: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zip: ''
    });
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [orderResponse, setOrderResponse] = useState(null);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!orderDetails || !uploadedFile) {
            toast.error('No item in cart');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('customerName', formData.customerName);
            data.append('mobile', formData.mobile);
            data.append('address', `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zip}`);
            data.append('productId', orderDetails.productId);
            data.append('image', uploadedFile);
            data.append('productDetails', JSON.stringify({
                size: orderDetails.size,
                material: orderDetails.material,
                quantity: orderDetails.quantity
            }));

            const response = await orderAPI.create(data);
            setOrderResponse(response.data.data);
            setIsSubmitted(true);
            toast.success('Order placed successfully!');
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.error || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!orderDetails && !isSubmitted) {
        return (
            <div className="py-24 text-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link to="/products" className="btn btn-primary">Go to Products</Link>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="py-24 min-h-[80vh] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center p-12 card-premium"
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Order Received!</h2>
                    <p className="text-slate-500 mb-8">
                        Thank you for your order! Your memories are in good hands. We'll start processing it right away.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl mb-8 text-left">
                        <p className="text-sm font-bold text-slate-800 mb-1">Order ID: #{orderResponse?.orderId}</p>
                        <p className="text-xs text-slate-500">Keep this ID to track your order status.</p>
                    </div>
                    <div className="grid gap-3">
                        <button
                            onClick={() => navigate('/track', { state: { orderId: orderResponse?.orderId } })}
                            className="btn btn-primary w-full"
                        >
                            Track Order
                        </button>
                        <Link to="/products" className="btn btn-secondary w-full">Continue Shopping</Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    const subtotal = orderDetails.productPrice * orderDetails.quantity;
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <div className="py-20 min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 font-medium">
                    <Link to="/products" className="hover:text-primary-600">Product</Link>
                    <ChevronRight size={14} />
                    <span className="text-slate-900 font-bold">Checkout</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="lg:w-2/3 space-y-8">
                        <div className="card-premium p-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Truck className="text-primary-600" />
                                Shipping Information
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Full Name</label>
                                        <input
                                            required
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                                        <input
                                            required
                                            name="mobile"
                                            value={formData.mobile}
                                            onChange={handleInputChange}
                                            type="tel"
                                            placeholder="10-digit number"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                                    <input
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        type="email"
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Shipping Address</label>
                                    <textarea
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Street, Building, Flat No."
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">City</label>
                                        <input name="city" value={formData.city} onChange={handleInputChange} required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">State</label>
                                        <input name="state" value={formData.state} onChange={handleInputChange} required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">ZIP</label>
                                        <input name="zip" value={formData.zip} onChange={handleInputChange} required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                                        <CreditCard className="text-primary-600" />
                                        Payment Method
                                    </h3>
                                    <div className="p-4 rounded-xl border-2 border-primary-600 bg-primary-50 text-primary-700 flex justify-between items-center">
                                        <div>
                                            <span className="font-bold block">Cash on Delivery</span>
                                            <span className="text-xs text-primary-500">Pay when your frame arrives</span>
                                        </div>
                                        <CheckCircle2 size={24} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full py-4 text-lg mt-8 disabled:opacity-70"
                                >
                                    {loading ? (
                                        <><Loader2 className="animate-spin mr-2" size={20} /> Processing...</>
                                    ) : (
                                        'Place Your Order'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:w-1/3">
                        <div className="card-premium p-8 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <ShoppingBag className="text-primary-600" />
                                Order Summary
                            </h2>
                            <div className="space-y-4 mb-6">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                        <img src={URL.createObjectURL(uploadedFile)} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-slate-800 leading-tight">{orderDetails.productName}</h4>
                                        <p className="text-xs text-slate-500">{orderDetails.size} | {orderDetails.material} | Qty: {orderDetails.quantity}</p>
                                        <p className="font-bold text-primary-600 mt-1">₹{orderDetails.productPrice}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-100">
                                <div className="flex justify-between text-slate-600">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-bold">FREE</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Estimated Tax</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-display font-black text-slate-900 pt-4 border-t border-slate-100">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
