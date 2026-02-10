import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Home, ShoppingBag } from 'lucide-react';
import { paymentAPI } from '../services/apiService';
import { toast } from 'sonner';

const PaymentStatus = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [order, setOrder] = useState(null);

    const merchantTransactionId = searchParams.get('merchantTransactionId');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!merchantTransactionId) {
                setLoading(false);
                setStatus('FAILED');
                return;
            }

            try {
                const response = await paymentAPI.phonePeStatus(merchantTransactionId);
                if (response.data.success) {
                    setStatus('SUCCESS');
                    setOrder(response.data.order);
                } else {
                    setStatus('FAILED');
                }
            } catch (error) {
                console.error('Status check error:', error);
                setStatus('FAILED');
                toast.error('Failed to verify payment status');
            } finally {
                setLoading(false);
            }
        };

        verifyPayment();
    }, [merchantTransactionId]);

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                <h2 className="text-2xl font-bold text-slate-800">Verifying your payment...</h2>
                <p className="text-slate-500">Please do not refresh or close this page.</p>
            </div>
        );
    }

    return (
        <div className="py-24 min-h-[80vh] flex items-center justify-center bg-slate-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full text-center p-12 card-premium bg-white shadow-xl"
            >
                {status === 'SUCCESS' ? (
                    <>
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Payment Successful!</h2>
                        <p className="text-slate-500 mb-8">
                            Thank you for your order! Your memories are in good hands. We'll start processing it right away.
                        </p>
                        <div className="bg-slate-50 p-4 rounded-xl mb-8 text-left">
                            <p className="text-sm font-bold text-slate-800 mb-1">Order ID: #{order?.orderId}</p>
                            <p className="text-xs text-slate-500">Keep this ID to track your order status.</p>
                        </div>
                        <div className="grid gap-3">
                            <button
                                onClick={() => navigate('/track', { state: { orderId: order?.orderId } })}
                                className="btn btn-primary w-full"
                            >
                                Track Order
                            </button>
                            <Link to="/products" className="btn btn-secondary w-full">Continue Shopping</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Payment Failed</h2>
                        <p className="text-slate-500 mb-8">
                            Something went wrong with your transaction. If money was deducted, it will be refunded automatically.
                        </p>
                        <div className="grid gap-3">
                            <Link to="/checkout" className="btn btn-primary w-full">Try Again</Link>
                            <Link to="/" className="btn btn-secondary w-full">Go to Home</Link>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default PaymentStatus;
