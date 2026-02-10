import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/apiService';

const Products = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const categories = ['All', 'Photo Frames', 'Canvas Prints', 'Custom Gifts', 'Collage Frames'];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productAPI.getAll();
                setProducts(response.data.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchCategory = activeCategory === 'All' || p.category === activeCategory;
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCategory && matchSearch;
    });

    const getImageUrl = (images) => {
        if (images && images.length > 0) {
            if (images[0].startsWith('http')) return images[0];
            return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${images[0]}`;
        }
        return 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=400';
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
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">Our Products</h1>
                        <p className="text-slate-500">Find the perfect home for your favorite memories</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all w-full md:w-64"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <Filter size={20} className="text-slate-600" />
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
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
                                <p className="text-xl font-display font-bold text-primary-600 mb-4">₹{product.price}</p>
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
                        <h3 className="text-xl font-bold text-slate-400">No products found.</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
