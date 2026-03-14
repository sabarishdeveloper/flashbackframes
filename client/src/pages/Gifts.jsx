import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/apiService';
import { FRAME_SIZES } from '../utils/constants';

const Gifts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productAPI.getAll();
                const gifts = response.data.data.filter(p => p.category === 'Custom Gifts');
                setProducts(gifts);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        return p.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getImageUrl = (images) => {
        if (images && images.length > 0) {
            if (images[0].startsWith('http')) return images[0];
            return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${images[0]}`;
        }
        return 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    return (
        <div className="py-20 min-h-screen">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">Unique Gifts</h1>
                        <p className="text-slate-500">Find the perfect personalized gift for your loved ones</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search gifts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all w-full md:w-64"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={product._id}
                            className="card-premium group"
                        >
                            <div className="relative h-72 overflow-hidden rounded-t-2xl">
                                <img
                                    src={getImageUrl(product.images)}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider text-slate-800">
                                        {product.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-primary-600 transition-colors h-14 overflow-hidden">
                                    {product.name}
                                </h3>
                                <p className="text-xl font-display font-bold text-primary-600 mb-4">
                                    {product.useGlobalPricing
                                        ? `From ₹${FRAME_SIZES[0].mat}`
                                        : `₹${product.price}`}
                                </p>
                                <Link
                                    to={`/product/${product._id}`}
                                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    View Details
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <h3 className="text-xl font-bold text-slate-400">No gifts found.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gifts;
