import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, CreditCard, Truck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { orderAPI, paymentAPI } from '../services/apiService';
import { loadRazorpayScript } from '../utils/loadRazorpay';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    // We can still support direct checkouts if needed, but primary is cartItems
    const directOrder = location.state?.orderDetails;
    const directFile = location.state?.file;

    const items = directOrder ? [{
        ...directOrder,
        imageFile: directFile
    }] : cartItems;

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
    const [paymentMethod, setPaymentMethod] = useState('Prepaid');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePayment = async (razorpayOrderId, amount, orderData) => {
        const res = await loadRazorpayScript();

        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: Math.round(amount * 100),
            currency: "INR",
            name: "Flashback Frames",
            description: "Photo Framing & Customized Gifts",
            image: "/logo.png",
            order_id: razorpayOrderId,
            handler: async function (response) {
                setLoading(true);
                try {
                    const finalData = new FormData();
                    finalData.append('razorpay_order_id', response.razorpay_order_id);
                    finalData.append('razorpay_payment_id', response.razorpay_payment_id);
                    finalData.append('razorpay_signature', response.razorpay_signature);

                    finalData.append('customerName', orderData.customerName);
                    finalData.append('mobile', orderData.mobile);
                    finalData.append('email', orderData.email);
                    finalData.append('address', orderData.address);
                    finalData.append('paymentMethod', 'Prepaid');

                    const itemsToSubmit = items.map(item => ({
                        productId: item.productId,
                        productName: item.name,
                        productPrice: item.price,
                        size: item.size,
                        material: item.material,
                        quantity: item.quantity
                    }));
                    finalData.append('items', JSON.stringify(itemsToSubmit));

                    items.forEach(item => {
                        finalData.append('images', item.imageFile);
                    });

                    const verifyRes = await paymentAPI.verifyAndCreate(finalData);

                    if (verifyRes.data.success) {
                        setOrderResponse(verifyRes.data.data);
                        setIsSubmitted(true);
                        clearCart();
                        toast.success('Payment successful and order placed!');
                    } else {
                        toast.error(verifyRes.data.error || 'Payment verification failed');
                    }
                } catch (error) {
                    console.error('Verification error:', error);
                    toast.error(error.response?.data?.error || 'Something went wrong during payment verification');
                } finally {
                    setLoading(false);
                }
            },
            prefill: {
                name: formData.customerName,
                email: formData.email,
                contact: formData.mobile,
            },
            notes: {
                address: formData.address,
            },
            theme: {
                color: "#4f46e5",
            },
            modal: {
                ondismiss: function () {
                    setLoading(false);
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
            toast.error(response.error.description || 'Payment Failed');
            setLoading(false);
        });
        paymentObject.open();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (items.length === 0) {
            toast.error('No item in cart');
            return;
        }

        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const totalAmount = subtotal + tax;

        const orderData = {
            customerName: formData.customerName,
            mobile: formData.mobile,
            email: formData.email,
            address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.zip}`,
        };

        setLoading(true);
        try {
            const data = new FormData();
            data.append('customerName', orderData.customerName);
            data.append('mobile', orderData.mobile);
            data.append('email', orderData.email);
            data.append('address', orderData.address);

            const itemsToSubmit = items.map(item => ({
                productId: item.productId,
                productName: item.name,
                productPrice: item.price,
                size: item.size,
                material: item.material,
                quantity: item.quantity
            }));
            data.append('items', JSON.stringify(itemsToSubmit));

            items.forEach(item => {
                data.append('images', item.imageFile);
            });

            if (paymentMethod === 'COD') {
                data.append('paymentMethod', 'COD');
                const orderCreateRes = await orderAPI.create(data);
                if (orderCreateRes.data.success) {
                    setOrderResponse(orderCreateRes.data.data);
                    setIsSubmitted(true);
                    clearCart();
                    toast.success('Order placed successfully (COD)!');
                }
            } else if (paymentMethod === 'PhonePe') {
                data.append('amount', totalAmount);
                const phonepeRes = await paymentAPI.phonePeInitiate(data);
                if (phonepeRes.data.success) {
                    // Note: PhonePe callback will need to handle multiple items too, which we updated in controller
                    window.location.href = phonepeRes.data.redirectUrl;
                } else {
                    toast.error(phonepeRes.data.error || 'PhonePe initiation failed');
                }
            } else {
                // Razorpay
                const rzpOrderRes = await paymentAPI.createOrder(totalAmount);
                if (rzpOrderRes.data.success) {
                    await handlePayment(
                        rzpOrderRes.data.order.id,
                        totalAmount,
                        orderData
                    );
                }
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.error || 'Failed to place order');
            setLoading(false);
        }
    };

    if (items.length === 0 && !isSubmitted) {
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

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <div className="py-20 min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 font-medium">
                    <Link to="/cart" className="hover:text-primary-600">Cart</Link>
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
                                    <div className="space-y-3">
                                        <div
                                            onClick={() => setPaymentMethod('Prepaid')}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${paymentMethod === 'Prepaid' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Prepaid' ? 'border-primary-600' : 'border-slate-300'}`}>
                                                    {paymentMethod === 'Prepaid' && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full" />}
                                                </div>
                                                <div>
                                                    <span className="font-bold block">Online Payment</span>
                                                    <span className="text-xs">Secure UPI, Card, Netbanking</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">UPI</span>
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">CARD</span>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod('PhonePe')}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${paymentMethod === 'PhonePe' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'PhonePe' ? 'border-primary-600' : 'border-slate-300'}`}>
                                                    {paymentMethod === 'PhonePe' && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full" />}
                                                </div>
                                                <div>
                                                    <span className="font-bold block">PhonePe</span>
                                                    <span className="text-xs">UPI, Cards, QR (Trusted)</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">UPI</span>
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod('COD')}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${paymentMethod === 'COD' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-primary-600' : 'border-slate-300'}`}>
                                                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full" />}
                                                </div>
                                                <div>
                                                    <span className="font-bold block">Cash on Delivery</span>
                                                    <span className="text-xs">Pay when your frame arrives</span>
                                                </div>
                                            </div>
                                            <Truck size={20} className={paymentMethod === 'COD' ? 'text-primary-600' : 'text-slate-400'} />
                                        </div>
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
                            <div className="space-y-6 mb-6 max-h-[400px] overflow-y-auto pr-2">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                                            {item.imageFile && <img src={URL.createObjectURL(item.imageFile)} alt="Preview" className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-grow">
                                            <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h4>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{item.size} | {item.material} | Qty: {item.quantity}</p>
                                            <p className="font-bold text-primary-600 text-sm mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-slate-100">
                                <div className="flex justify-between text-slate-600 text-sm">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-bold uppercase text-[10px]">FREE</span>
                                </div>
                                <div className="flex justify-between text-slate-600 text-sm">
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
