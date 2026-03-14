import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Minus, ShoppingCart, Share2, Upload, Check, Loader2, Trash2, X } from 'lucide-react';
import { productAPI } from '../services/apiService';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';
import { FRAME_SIZES, getPriceForSize, FRAME_FINISHES, ART_STYLES } from '../utils/constants';

import femaleSizesImg from '../assets/female-sizes.jpeg';
import maleSizesImg from '../assets/male-size.jpeg';
import generalSizesImg from '../assets/sizes.jpeg';

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
        if (files.length === 0) return;

        const validFiles = files.filter(file => {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} exceeds 10MB limit`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const isCollage = product.category === 'Collage Frames';

        if (isCollage) {
            setQueuedItems(prev => {
                if (prev.length === 0) {
                    return [{
                        id: Math.random().toString(36).substr(2, 9),
                        files: validFiles,
                        size: product.useGlobalPricing ? FRAME_SIZES[0].size : (product.options?.sizes[0] || ''),
                        material: product.useGlobalPricing ? FRAME_FINISHES[0] : (product.options?.materials[0] || ''),
                        artStyle: ART_STYLES[0].name,
                        quantity: 1,
                        personalMessage: '',
                        instructions: ''
                    }];
                } else {
                    // Update the first and only item for collages
                    return [{
                        ...prev[0],
                        files: [...prev[0].files, ...validFiles]
                    }];
                }
            });
            toast.success(`${validFiles.length} photo(s) added to collage`);
        } else {
            const newItems = validFiles.map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                size: product.useGlobalPricing ? FRAME_SIZES[0].size : (product.options?.sizes[0] || ''),
                material: product.useGlobalPricing ? FRAME_FINISHES[0] : (product.options?.materials[0] || ''),
                artStyle: ART_STYLES[0].name,
                quantity: 1,
                personalMessage: '',
                instructions: ''
            }));
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

    const handleAddToCart = async (isBuyNow = false) => {
        if (queuedItems.length === 0) {
            toast.error('Please upload at least one photo');
            fileInputRef.current.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        try {
            // Wait for all items to be added (including IDB file saving)
            await Promise.all(queuedItems.map(async (item) => {
                let itemPrice = product.price;
                if (product.useGlobalPricing) {
                    itemPrice = getPriceForSize(item.size, item.material);
                } else if (item.material && product.materialPrices && product.materialPrices[item.material.toLowerCase()]) {
                    itemPrice = product.materialPrices[item.material.toLowerCase()];
                }

                const imageFiles = item.files || item.file;

                await addToCart({
                    ...product,
                    price: itemPrice
                }, {
                    size: item.size,
                    material: item.material,
                    artStyle: item.artStyle,
                    quantity: item.quantity,
                    personalMessage: item.personalMessage,
                    instructions: item.instructions
                }, imageFiles);
            }));

            toast.success(`${queuedItems.length} item(s) added to cart!`);
            setQueuedItems([]); // Clear queue after adding

            if (isBuyNow) {
                navigate('/cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add items to cart. Please try again.');
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
        <div className="pt-8 pb-8 bg-white min-h-screen">
            <div className="container mx-auto px-4 md:px-6">
                <Link to="/products" className="inline-flex items-center text-slate-500 hover:text-primary-600 mb-8 transition-colors">
                    <ChevronLeft size={20} />
                    <span className="font-medium">Back to Products</span>
                </Link>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Gallery */}
                    <div className="lg:w-1/2 flex flex-col gap-6">
                        <div className="relative group">
                            <div className="aspect-[4/4] rounded-3xl overflow-hidden bg-slate-100 shadow-xl border border-slate-100 relative">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeImage}
                                        src={activeImage}
                                        alt={product.name}
                                        initial={{ opacity: 0, x: 100 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        onDragEnd={(e, { offset, velocity }) => {
                                            if (product.images.length <= 1) return;
                                            const swipeThreshold = 50;
                                            if (offset.x < -swipeThreshold) {
                                                // Swipe Left -> Next Image
                                                const currentIndex = product.images.findIndex(img => getImageUrl(img) === activeImage);
                                                const nextIndex = (currentIndex + 1) % product.images.length;
                                                setActiveImage(getImageUrl(product.images[nextIndex]));
                                            } else if (offset.x > swipeThreshold) {
                                                // Swipe Right -> Prev Image
                                                const currentIndex = product.images.findIndex(img => getImageUrl(img) === activeImage);
                                                const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
                                                setActiveImage(getImageUrl(product.images[prevIndex]));
                                            }
                                        }}
                                        transition={{
                                            x: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 }
                                        }}
                                        className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
                                    />
                                </AnimatePresence>

                                {/* Navigation Arrows */}
                                {product.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => {
                                                const currentIndex = product.images.findIndex(img => getImageUrl(img) === activeImage);
                                                const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
                                                setActiveImage(getImageUrl(product.images[prevIndex]));
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const currentIndex = product.images.findIndex(img => getImageUrl(img) === activeImage);
                                                const nextIndex = (currentIndex + 1) % product.images.length;
                                                setActiveImage(getImageUrl(product.images[nextIndex]));
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
                                        >
                                            <ChevronLeft size={24} className="rotate-180" />
                                        </button>
                                    </>
                                )}

                                {/* Dot Indicators */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {product.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(getImageUrl(img))}
                                            className={`h-1.5 rounded-full transition-all ${activeImage === getImageUrl(img) ? 'w-8 bg-primary-600' : 'w-2 bg-slate-400/50 hover:bg-slate-400'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto p-2 scrollbar-active">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(getImageUrl(img))}
                                    className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === getImageUrl(img) ? 'border-primary-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                >
                                    <img src={getImageUrl(img)} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
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
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">{product.name}</h1>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-3xl font-display font-bold text-primary-600">
                                    {product.useGlobalPricing
                                        ? `₹${getPriceForSize(queuedItems[0]?.size || FRAME_SIZES[0].size, queuedItems[0]?.material || FRAME_FINISHES[0])}`
                                        : (
                                            (queuedItems[0]?.material && product.materialPrices && product.materialPrices[queuedItems[0]?.material.toLowerCase()])
                                                ? `₹${product.materialPrices[queuedItems[0]?.material.toLowerCase()]}`
                                                : `₹${product.price}`
                                        )
                                    }
                                </span>
                                {product.useGlobalPricing && (
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 block">
                                        Price varies by size
                                    </span>
                                )}
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
                                                key={item.id}
                                                className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-5"
                                            >
                                                {item.files ? (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h5 className="font-bold text-slate-800 text-sm">Collage Collection</h5>
                                                                <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest">{item.files.length} Photos Selected</p>
                                                            </div>
                                                            <button onClick={() => removeQueuedItem(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.files.map((file, idx) => (
                                                                <div key={idx} className="relative group/photo w-16 h-16 rounded-lg overflow-hidden border border-slate-100">
                                                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newFiles = item.files.filter((_, i) => i !== idx);
                                                                            if (newFiles.length === 0) {
                                                                                removeQueuedItem(item.id);
                                                                            } else {
                                                                                updateQueuedItem(item.id, { files: newFiles });
                                                                            }
                                                                        }}
                                                                        className="absolute top-0 right-0 bg-rose-500 text-white p-1 rounded-bl-lg opacity-0 group-hover/photo:opacity-100 transition-all scale-75"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-4">
                                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                                                            <img src={URL.createObjectURL(item.file)} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <div className="flex justify-between items-start">
                                                                <h5 className="font-bold text-slate-800 text-sm truncate pr-4">{item.file.name}</h5>
                                                                <button onClick={() => removeQueuedItem(item.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                                                                    <Minus size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between py-2 border-y border-slate-50">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</span>
                                                    <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                                                        <button
                                                            onClick={() => updateQueuedItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                                                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white transition-colors"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQueuedItem(item.id, { quantity: item.quantity + 1 })}
                                                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-white transition-colors"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
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
                                                            {product.useGlobalPricing
                                                                ? FRAME_SIZES.map(s => <option key={s.size} value={s.size}>{s.size}</option>)
                                                                : product.options.sizes.map(s => <option key={s} value={s}>{s}</option>)
                                                            }
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Finish</p>
                                                        <select
                                                            value={item.material}
                                                            onChange={(e) => updateQueuedItem(item.id, { material: e.target.value })}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary-500"
                                                        >
                                                            {product.useGlobalPricing
                                                                ? FRAME_FINISHES.map(f => <option key={f} value={f}>{f}</option>)
                                                                : product.options.materials.map(m => <option key={m} value={m}>{m}</option>)
                                                            }
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Art Style / Design</p>
                                                    <select
                                                        value={item.artStyle}
                                                        onChange={(e) => updateQueuedItem(item.id, { artStyle: e.target.value })}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary-500"
                                                    >
                                                        {ART_STYLES.map(style => (
                                                            <option key={style.id} value={style.name}>
                                                                {style.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-3 pt-2">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal Message (Optional)</p>
                                                        <textarea
                                                            value={item.personalMessage}
                                                            onChange={(e) => updateQueuedItem(item.id, { personalMessage: e.target.value })}
                                                            placeholder="Add a message to be printed or included with the frame..."
                                                            rows="2"
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500 resize-none"
                                                        ></textarea>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Special Instructions (Optional)</p>
                                                        <textarea
                                                            value={item.instructions}
                                                            onChange={(e) => updateQueuedItem(item.id, { instructions: e.target.value })}
                                                            placeholder="Specific placement, color corrections, or notes for the designer..."
                                                            rows="2"
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary-500 resize-none"
                                                        ></textarea>
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
                            <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-8">
                                <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-black">Secure Checkout Guaranteed</p>
                                <div className="flex justify-center items-center gap-6 opacity-60">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="px-2 py-1 border border-slate-100 rounded bg-white shadow-sm flex items-center justify-center">
                                            <span className="text-[8px] font-black italic text-[#1434CB]">VISA</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="px-2 py-1 border border-slate-100 rounded bg-white shadow-sm flex items-center justify-center">
                                            <div className="flex -space-x-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#EB001B]"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] opacity-80"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="px-2 py-1 border border-slate-100 rounded bg-white shadow-sm flex items-center justify-center">
                                            <span className="text-[8px] font-black text-[#5C2D91]">UPI</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="px-2 py-1 border border-slate-100 rounded bg-white shadow-sm flex items-center justify-center">
                                            <span className="text-[8px] font-black text-slate-800">RuPay</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Size Guide Section */}
            <div className="container mx-auto px-4 md:px-6 mt-24 mb-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Size Guide</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">Visualize how different frame sizes will look in your space. Use these guides to choose the perfect dimensions for your memories.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="card-premium p-4 group">
                        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[3/4]">
                            <img
                                src={generalSizesImg}
                                alt="General Size Guide"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mt-4 text-center">Standard Sizes</h3>
                    </div>
                    <div className="card-premium p-4 group">
                        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[3/4]">
                            <img
                                src={femaleSizesImg}
                                alt="Scale Reference (Female)"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mt-4 text-center">Scale Reference</h3>
                    </div>
                    <div className="card-premium p-4 group">
                        <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-[3/4]">
                            <img
                                src={maleSizesImg}
                                alt="Scale Reference (Male)"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mt-4 text-center">Scale Reference</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
