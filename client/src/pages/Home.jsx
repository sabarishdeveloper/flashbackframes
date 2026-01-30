import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Image as ImageIcon, Gift, CheckCircle, Star } from 'lucide-react';
import { productAPI } from '../services/apiService';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const response = await productAPI.getAll();
                // Take first 4 for home page
                setFeaturedProducts(response.data.data.slice(0, 4));
            } catch (err) {
                console.error(err);
            }
        };
        fetchRecent();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const getImageUrl = (images) => {
        if (images && images.length > 0) {
            if (images[0].startsWith('http')) return images[0];
            return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${images[0]}`;
        }
        return 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=400';
    };

    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 bg-gradient-to-br from-primary-50 via-white to-accent-50/30">
                <div className="container mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider mb-6">
                                <Star size={14} className="fill-primary-700" />
                                <span>Premium Quality Frames</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-slate-900 leading-tight mb-6">
                                Turn Your <span className="gradient-text">Memories</span> Into Art
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                                Experience the beauty of high-quality photo framing and personalized gifts. Handcrafted to preserve your special moments forever.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/products" className="btn btn-primary text-lg px-8 py-4">
                                    Browse Collection
                                    <ArrowRight size={20} className="ml-2" />
                                </Link>
                                <Link to="/track" className="btn btn-secondary text-lg px-8 py-4">
                                    Track Your Order
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="lg:w-1/2 relative"
                        >
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800"
                                    alt="Beautiful Framing"
                                    className="w-full aspect-[4/5] object-cover"
                                />
                            </div>
                            {/* Floating Elements */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -top-10 -right-10 w-40 h-40 bg-white p-4 rounded-2xl shadow-xl hidden md:block"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200"
                                    alt="Floating Frame"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 20, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                                className="absolute -bottom-10 -left-10 w-48 h-24 bg-white p-3 rounded-2xl shadow-xl hidden md:block flex items-center gap-3"
                            >
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">Perfect Delivery</p>
                                    <p className="text-xs text-slate-500">100% Secure</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Featured Collection</h2>
                            <p className="text-slate-500">Discover our most loved hand-crafted items</p>
                        </div>
                        <Link to="/products" className="group flex items-center gap-1 text-primary-600 font-bold hover:underline">
                            View All <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {featuredProducts.map((p) => (
                            <motion.div key={p._id} variants={item} className="card-premium group overflow-hidden">
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={getImageUrl(p.images)}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-5">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{p.category}</p>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary-600 transition-colors h-12 overflow-hidden">{p.name}</h3>
                                    <p className="text-primary-600 font-bold">${p.price}</p>
                                    <Link to={`/product/${p._id}`} className="mt-4 block w-full py-2 rounded-lg bg-slate-50 text-center text-sm font-bold text-slate-700 hover:bg-primary-600 hover:text-white transition-all">
                                        View Details
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6">How It Works</h2>
                        <p className="text-slate-500">Creating your custom frame is easier than ever. Just follow these simple steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary-600 mx-auto mb-6">
                                <ImageIcon size={32} />
                            </div>
                            <h3 className="text-xl font-bold">1. Upload Photo</h3>
                            <p className="text-slate-500">Pick your favorite photo from your gallery or social media.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-accent-500 mx-auto mb-6">
                                <Gift size={32} />
                            </div>
                            <h3 className="text-xl font-bold">2. Customize</h3>
                            <p className="text-slate-500">Choose frame size, color, and add personal messages.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-green-500 mx-auto mb-6">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold">3. Get Delivered</h3>
                            <p className="text-slate-500">Sit back and relax while we handcrafted and deliver your memories.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            {/* ... Rest of the file ... */}
        </div>
    );
};

export default Home;
