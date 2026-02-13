import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const navigate = useNavigate();

    const subtotal = getCartTotal();
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const handleCheckout = () => {
        // Check if all items have uploaded images
        const missingImage = cartItems.find(item => !item.imageFile);
        if (missingImage) {
            toast.error(`Please upload an image for ${missingImage.name}`);
            navigate(`/product/${missingImage.productId}`);
            return;
        }
        navigate('/checkout');
    };

    if (cartItems.length === 0) {
        return (
            <div className="py-24 min-h-[70vh] flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
                    <ShoppingBag size={48} />
                </div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Your cart is empty</h2>
                <p className="text-slate-500 mb-8 max-w-xs text-center">
                    Looks like you haven't added any memories to your collection yet.
                </p>
                <Link to="/products" className="btn btn-primary px-8">
                    Browse Products
                </Link>
            </div>
        );
    }

    return (
        <div className="py-20 min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center gap-2 mb-8 text-sm text-slate-500 font-medium">
                    <Link to="/products" className="hover:text-primary-600">Products</Link>
                    <ChevronLeft size={14} />
                    <span className="text-slate-900 font-bold">Shopping Cart</span>
                </div>

                <h1 className="text-4xl font-display font-bold text-slate-900 mb-10">Your Memories</h1>

                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="lg:w-2/3 space-y-4">
                        <AnimatePresence>
                            {cartItems.map((item) => (
                                <motion.div
                                    key={item.cartId}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="card-premium p-6 flex flex-col sm:flex-row gap-6 items-center"
                                >
                                    <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                                        {item.imageFile ? (
                                            <img
                                                src={URL.createObjectURL(item.imageFile)}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-grow text-center sm:text-left">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-4 text-sm font-medium text-slate-500">
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Size: {item.size}</span>
                                            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">Material: {item.material}</span>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-4">
                                            <div className="flex items-center bg-slate-100 rounded-xl p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.cartId)}
                                                className="text-rose-500 hover:text-rose-600 transition-colors p-2 rounded-lg hover:bg-rose-50"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="text-right flex flex-col justify-between h-full min-w-[100px]">
                                        <p className="text-2xl font-display font-black text-primary-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">₹{item.price} each</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div className="pt-6">
                            <Link to="/products" className="inline-flex items-center gap-2 text-primary-600 font-bold hover:underline">
                                <ChevronLeft size={18} />
                                Add more items
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-1/3">
                        <div className="card-premium p-8 sticky top-24">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="font-medium">Subtotal</span>
                                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 p-3">
                                    <span className="font-medium">Estimated Tax (8%)</span>
                                    <span className="font-bold">₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 p-3">
                                    <span className="font-medium">Shipping</span>
                                    <span className="text-green-600 font-bold uppercase tracking-widest text-xs">Free</span>
                                </div>
                                <div className="border-t border-slate-100 pt-4 flex justify-between text-2xl font-display font-black text-slate-900">
                                    <span>Total</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="btn btn-primary w-full py-4 text-lg shadow-xl shadow-primary-200"
                            >
                                Proceed to Checkout
                                <ArrowRight size={20} className="ml-2" />
                            </button>

                            <div className="mt-6 flex flex-col gap-4">
                                <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-black">Secure Checkout Guaranteed</p>
                                <div className="flex justify-center items-center gap-4 opacity-70">
                                    <div className="px-2 py-1 border border-slate-200 rounded-md bg-white shadow-sm flex items-center justify-center">
                                        <span className="text-[8px] font-black italic text-[#1434CB]">VISA</span>
                                    </div>
                                    <div className="px-2 py-1 border border-slate-200 rounded-md bg-white shadow-sm flex items-center justify-center">
                                        <div className="flex -space-x-1">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#EB001B]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] opacity-80"></div>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 border border-slate-200 rounded-md bg-white shadow-sm flex items-center justify-center">
                                        <span className="text-[8px] font-black text-[#5C2D91]">UPI</span>
                                    </div>
                                    <div className="px-2 py-1 border border-slate-200 rounded-md bg-white shadow-sm flex items-center justify-center">
                                        <span className="text-[8px] font-black text-slate-800">RuPay</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
