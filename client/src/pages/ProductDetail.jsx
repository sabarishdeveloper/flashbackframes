import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, Minus, ShoppingCart, Share2, Upload, Check, Loader2 } from 'lucide-react';
import { productAPI } from '../services/apiService';
import { toast } from 'sonner';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [activeImage, setActiveImage] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productAPI.getById(id);
                const data = response.data.data;
                setProduct(data);
                setSelectedSize(data.options.sizes[0] || '');
                setSelectedMaterial(data.options.materials[0] || '');

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
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size exceeds 10MB limit');
                return;
            }
            setUploadedFile(file);
            toast.success('Photo uploaded successfully');
        }
    };

    const handleOrderNow = () => {
        if (!uploadedFile) {
            toast.error('Please upload a photo for your frame');
            fileInputRef.current.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Save order details to temporary state/localStorage for checkout
        const orderData = {
            productId: product._id,
            productName: product.name,
            productPrice: product.price,
            quantity,
            size: selectedSize,
            material: selectedMaterial,
            // We can't easily save the File object to localStorage, so we'll pass via state or ref
        };

        // In a real app with global state, we'd use Redux/Context. 
        // For this simple version, let's pass state via navigate
        navigate('/checkout', { state: { orderDetails: orderData, file: uploadedFile } });
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
                                <span className="text-3xl font-display font-bold text-primary-600">${product.price}</span>
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
                            {/* Size Selection */}
                            {product.options.sizes && product.options.sizes.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Select Size</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.options.sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border-2 ${selectedSize === size
                                                        ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                                                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Material Selection */}
                            {product.options.materials && product.options.materials.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Frame Material</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {product.options.materials.map((mat) => (
                                            <button
                                                key={mat}
                                                onClick={() => setSelectedMaterial(mat)}
                                                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all border-2 ${selectedMaterial === mat
                                                        ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                                                        : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                                    }`}
                                            >
                                                {mat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Photo Upload */}
                            <div ref={fileInputRef} className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                                <div className="flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${uploadedFile ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'}`}>
                                        {uploadedFile ? <Check size={24} /> : <Upload size={24} />}
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-1">
                                        {uploadedFile ? 'Photo Selected!' : 'Step 3: Upload Your Photo'}
                                    </h4>
                                    <p className="text-sm text-slate-500 mb-4">{uploadedFile ? uploadedFile.name : 'Drag and drop or click to browse (Max 10MB)'}</p>
                                    <label className={`btn py-2 px-6 text-sm cursor-pointer ${uploadedFile ? 'btn-secondary border-green-200 text-green-700' : 'btn-primary'}`}>
                                        {uploadedFile ? 'Change Photo' : 'Upload Photo'}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>

                            {/* Quantity and CTA */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <div className="flex items-center bg-slate-100 rounded-xl p-1 w-fit">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>

                                <button onClick={handleOrderNow} className="btn btn-primary flex-grow text-lg py-4">
                                    <ShoppingCart size={20} className="mr-2" />
                                    Order Now
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
