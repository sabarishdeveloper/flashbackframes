import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Minus, ShoppingCart, Share2, Upload, Check, Loader2 } from 'lucide-react';
import { productAPI } from '../services/apiService';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
    const { addToCart } = useCart();
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [queuedItems, setQueuedItems] = useState([]);
    const [activeImage, setActiveImage] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productAPI.getById(id);
                const data = response.data.data;
                setProduct(data);

                const initialImg = data.images && data.images.length > 0
                    ? getImageUrl(data.images[0])
                    : 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800';
                setActiveImage(initialImg);
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Product not found');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${url}`;
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newItems = files.map(file => {
                if (file.size > 10 * 1024 * 1024) {
                    toast.error(`File ${file.name} exceeds 10MB limit`);
                    return null;
                }
                return {
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    size: product.options.sizes[0] || '',
                    material: product.options.materials[0] || '',
                    quantity: 1
                };
            }).filter(item => item !== null);

            setQueuedItems(prev => [...prev, ...newItems]);
            toast.success(`${newItems.length} photo(s) added successfully`);
        }
    };

    const updateQueuedItem = (id, updates) => {
        setQueuedItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updates } : item
        ));
    };

    const removeQueuedItem = (id) => {
        setQueuedItems(prev => prev.filter(item => item.id !== id));
    };

    const handleAddToCart = (isBuyNow = false) => {
        if (queuedItems.length === 0) {
            toast.error('Please upload at least one photo');
            fileInputRef.current.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        queuedItems.forEach(item => {
            addToCart(product, {
                size: item.size,
                material: item.material,
                quantity: item.quantity
            }, item.file);
        });

        toast.success(`${queuedItems.length} item(s) added to cart!`);
        setQueuedItems([]); // Clear queue after adding

        if (isBuyNow) {
            navigate('/cart');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary-600" size={48} />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="py-24 bg-white min-h-screen">
            <div className="container mx-auto px-4 md:px-6">
                <Link to="/products" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-8 transition-colors">
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back to Products</span>
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Gallery */}
                    <div className="lg:w-1/2 flex flex-col gap-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-xl border border-slate-100"
                        >
                            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                        </motion.div>
                        <div className="flex gap-4">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(getImageUrl(img))}
                                    className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === getImageUrl(img) ? 'border-primary-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={getImageUrl(img)} alt="Thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="lg:w-1/2 space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-primary-600 uppercase tracking-widest">Premium Collection</span>
                                <span className="text-slate-300">|</span>
                                <div className="flex text-yellow-500">
                                    <Check size={16} />
                                </div>
                                <span className="text-sm text-slate-500 font-medium">In Stock</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-3xl font-display font-bold text-primary-600">₹{product.price}</span>
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                    <span className="text-yellow-700 font-bold text-sm">4.8</span>
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Check key={star} size={12} className="fill-yellow-500 text-yellow-500" />
                                        ))}
                                    </div>
                                    <span className="text-slate-400 text-xs ml-1">(124 reviews)</span>
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-lg">{product.description}</p>
                        </div>

                        <div className="space-y-6">
                            {/* Unified Photo Upload Box */}
                            <div ref={fileInputRef} className="p-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary-400 transition-all group">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Upload Your Photos</h4>
                                    <p className="text-slate-500 mb-6 max-w-sm">Select one or more photos to frame. You can customize size and material for each after uploading.</p>
                                    <label className="btn btn-primary px-8 py-3 cursor-pointer">
                                        Choose Photos
                                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
                                    </label>
                                    <p className="text-xs text-slate-400 mt-4 uppercase tracking-widest font-bold">Max 10MB per image</p>
                                </div>
                            </div>

                            {/* Configuration Queue */}
                            {queuedItems.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            Customizing {queuedItems.length} Photo(s)
                                        </h3>
                                        <button onClick={() => setQueuedItems([])} className="text-sm font-bold text-rose-500 hover:text-rose-600">Clear All</button>
                                    </div>

                                    <div className="space-y-4">
                                        {queuedItems.map((item) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={item.id}
                                                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-4"
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                                        <img src={URL.createObjectURL(item.file)} alt="Preview" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-grow min-w-0">
                                                        <div className="flex justify-between items-start">
                                                            <h5 className="font-bold text-slate-800 text-sm truncate pr-4">{item.file.name}</h5>
                                                            <button onClick={() => removeQueuedItem(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                                                                <Minus size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <div className="flex items-center bg-slate-50 rounded-lg p-1">
                                                                <button
                                                                    onClick={() => updateQueuedItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                                                                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-white"
                                                                >
                                                                    <Minus size={12} />
                                                                </button>
                                                                <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                                <button
                                                                    onClick={() => updateQueuedItem(item.id, { quantity: item.quantity + 1 })}
                                                                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-white"
                                                                >
                                                                    <Plus size={12} />
                                                                </button>
                                                            </div>
                                                            <span className="text-xs text-slate-400 flex items-center">Size & Material options below</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Size</p>
                                                        <select
                                                            value={item.size}
                                                            onChange={(e) => updateQueuedItem(item.id, { size: e.target.value })}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary-500"
                                                        >
                                                            {product.options.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Material</p>
                                                        <select
                                                            value={item.material}
                                                            onChange={(e) => updateQueuedItem(item.id, { material: e.target.value })}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary-500"
                                                        >
                                                            {product.options.materials.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Global Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button onClick={() => handleAddToCart(false)} className="btn btn-secondary flex-grow text-lg py-4 border-2 border-primary-100">
                                    <Plus size={20} className="mr-2" />
                                    Add All to Cart
                                </button>

                                <button onClick={() => handleAddToCart(true)} className="btn btn-primary flex-grow text-lg py-4">
                                    <ShoppingCart size={20} className="mr-2" />
                                    Buy Now
                                </button>

                                <button className="btn btn-secondary p-4 w-14">
                                    <Share2 size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
