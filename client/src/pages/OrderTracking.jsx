import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Printer, Palette, Truck, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { orderAPI } from '../services/apiService';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

const OrderTracking = () => {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState(location.state?.orderId || '');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    const statusSteps = [
        { label: 'Received', icon: <Clock size={24} />, key: 'Received' },
        { label: 'In Design', icon: <Palette size={24} />, key: 'In Design' },
        { label: 'Printing', icon: <Printer size={24} />, key: 'Printing' },
        { label: 'Ready', icon: <Package size={24} />, key: 'Ready' },
        { label: 'Delivered', icon: <Truck size={24} />, key: 'Delivered' },
    ];

    const getStepStatus = (stepKey, currentStatus) => {
        const statusOrder = statusSteps.map(s => s.key);
        const currentIndex = statusOrder.indexOf(currentStatus);
        const stepIndex = statusOrder.indexOf(stepKey);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!searchTerm) return;

        setLoading(true);
        setOrder(null);
        try {
            const response = await orderAPI.track(searchTerm);
            setOrder(response.data.data);
        } catch (error) {
            console.error('Tracking error:', error);
            toast.error('Order not found. Please check Order ID or Mobile number.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location.state?.orderId) {
            const fetchInitial = async () => {
                setLoading(true);
                try {
                    const response = await orderAPI.track(location.state.orderId);
                    setOrder(response.data.data);
                } catch (err) { }
                setLoading(false);
            };
            fetchInitial();
        }
    }, [location.state]);

    return (
        <div className="py-24 min-h-screen bg-slate-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">Track Your Order</h1>
                        <p className="text-slate-500">Enter your Order ID or Mobile Number to see current status</p>
                    </div>

                    <div className="card-premium p-8 md:p-12 mb-12">
                        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Order ID (e.g. FF-82931) or Mobile"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                />
                            </div>
                            <button disabled={loading} type="submit" className="btn btn-primary px-10 py-4 text-lg disabled:opacity-70">
                                {loading ? <Loader2 className="animate-spin" /> : 'Track Status'}
                            </button>
                        </form>
                    </div>

                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            <div className="card-premium p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Order #{order.orderId}</h3>
                                        <p className="text-slate-500 text-sm">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-bold uppercase tracking-wider">
                                        {order.status}
                                    </div>
                                </div>

                                {/* Status UI */}
                                <div className="relative">
                                    <div className="absolute top-6 left-6 md:left-0 md:top-6 w-[2px] md:w-full h-[calc(100%-48px)] md:h-[2px] bg-slate-100 -z-0">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(statusSteps.findIndex(s => s.key === order.status) / (statusSteps.length - 1)) * 100}%`
                                            }}
                                            className="h-full bg-primary-500 hidden md:block"
                                        ></motion.div>
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between relative z-10 gap-10 md:gap-4">
                                        {statusSteps.map((step, idx) => {
                                            const stepStatus = getStepStatus(step.key, order.status);
                                            return (
                                                <div key={idx} className="flex md:flex-col items-start md:items-center gap-4 md:gap-2 flex-1">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${stepStatus === 'completed' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' :
                                                        stepStatus === 'current' ? 'bg-white border-2 border-primary-600 text-primary-600 animate-pulse' :
                                                            'bg-white border-2 border-slate-100 text-slate-300'
                                                        }`}>
                                                        {stepStatus === 'completed' ? <CheckCircle size={24} /> : step.icon}
                                                    </div>
                                                    <div className="md:text-center">
                                                        <h4 className={`font-bold text-sm ${stepStatus === 'upcoming' ? 'text-slate-400' : 'text-slate-900'
                                                            }`}>
                                                            {step.label}
                                                        </h4>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="card-premium p-8 grid grid-cols-1 md:grid-cols-2 gap-10 text">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Order Summary</h4>
                                    <div className="space-y-3">
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-slate-500">
                                                        {item.quantity}x {item.productName || item.productId?.name} ({item.size}, {item.material})
                                                    </span>
                                                    <span className="font-bold text-slate-800">₹{(item.productPrice * item.quantity).toFixed(2)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">
                                                    {order.productDetails?.quantity}x {order.productId?.name || 'Product'} ({order.productDetails?.size}, {order.productDetails?.material})
                                                </span>
                                                <span className="font-bold text-slate-800">₹{order.totalPrice?.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2 flex justify-between font-bold text-slate-900 text-lg border-t border-slate-50 mt-4">
                                        <span>Total Amount</span>
                                        <span>₹{order.totalPrice?.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="space-y-4 text">
                                    <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Shipping To</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                        {order.customerName}<br />
                                        {order.address}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
