import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, ShoppingBag, DollarSign, Package,
    Search, Bell, Edit2, Trash2, Ticket,
    Download, Filter, Sidebar, Loader2, LogOut, Plus, X, Eye, Menu
} from 'lucide-react';
import { orderAPI, productAPI, couponAPI } from '../services/apiService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const getStatusColor = (status) => {
    switch (status) {
        case 'Delivered': return 'bg-emerald-100 text-emerald-700';
        case 'Printing':
        case 'In Design': return 'bg-primary-100 text-primary-700';
        case 'Received': return 'bg-amber-100 text-amber-700';
        case 'Ready': return 'bg-blue-100 text-blue-700';
        case 'Cancelled': return 'bg-rose-100 text-rose-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${url}`;
};

const ProductModal = ({
    isOpen,
    onClose,
    editingProduct,
    previewImages,
    setPreviewImages,
    handleProductSubmit
}) => {
    const [useGlobal, setUseGlobal] = useState(editingProduct?.useGlobalPricing || false);

    useEffect(() => {
        setUseGlobal(editingProduct?.useGlobalPricing || false);
    }, [editingProduct, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-display font-bold text-slate-900">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleProductSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Product Name</label>
                            <input
                                name="name"
                                defaultValue={editingProduct?.name}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="e.g. Classic Wooden Frame"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
                            <select
                                name="category"
                                defaultValue={editingProduct?.category}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            >
                                <option value="">Select Category</option>
                                <option value="Photo Frames">Photo Frames</option>
                                <option value="Canvas Prints">Canvas Prints</option>
                                <option value="Custom Gifts">Custom Gifts</option>
                                <option value="Collage Frames">Collage Frames</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Price</label>
                            <input
                                name="price"
                                type="number"
                                defaultValue={editingProduct?.price}
                                required={!useGlobal}
                                disabled={useGlobal}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                placeholder={useGlobal ? "Fixed by Size" : "0.00"}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-primary-50/50 rounded-2xl border border-primary-100">
                        <input
                            type="checkbox"
                            name="useGlobalPricing"
                            id="useGlobalPricing"
                            checked={useGlobal}
                            onChange={(e) => setUseGlobal(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <div>
                            <label htmlFor="useGlobalPricing" className="text-sm font-bold text-slate-900 block">Use Global Frame Pricing</label>
                            <p className="text-[10px] text-slate-500 leading-tight">If enabled, this product will use fixed prices based on frame sizes (8x6, 12x18, etc.)</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
                        <textarea
                            name="description"
                            defaultValue={editingProduct?.description}
                            rows="3"
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            placeholder="Product details..."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Sizes (comma separated)</label>
                            <input
                                name="sizes_input"
                                defaultValue={editingProduct?.options?.sizes?.join(', ')}
                                disabled={useGlobal}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                placeholder={useGlobal ? "All Standard Sizes Enabled" : "8x10, 12x15, 20x24"}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">{useGlobal ? 'Finish (Standard)' : 'Finishes (comma separated)'}</label>
                            <input
                                name="materials_input"
                                defaultValue={editingProduct?.options?.materials?.join(', ')}
                                disabled={useGlobal}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
                                placeholder={useGlobal ? "Standard Finishes Enabled" : "Mat, Glossy, Glitter"}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Upload Photos</label>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-2">
                            {(previewImages.length > 0 ? previewImages : (editingProduct?.images || [])).map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-200 relative group">
                                    <img
                                        src={typeof img === 'string' ? getImageUrl(img) : URL.createObjectURL(img)}
                                        className="w-full h-full object-cover"
                                        alt="Preview"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-[8px] text-white font-bold uppercase">Image {idx + 1}</span>
                                    </div>
                                </div>
                            ))}
                            {previewImages.length === 0 && (!editingProduct?.images || editingProduct.images.length === 0) && (
                                <div className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                    <Package size={24} />
                                </div>
                            )}
                        </div>

                        <input
                            name="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = Array.from(e.target.files);
                                setPreviewImages(files);
                            }}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                        {editingProduct && <p className="text-[10px] text-amber-500 italic font-medium">Tip: Uploading new photos will replace all existing ones. Keep empty to maintain current photos.</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                        >
                            {editingProduct ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const CouponModal = ({ isOpen, onClose, handleCouponSubmit }) => {
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'flat',
        discountValue: '',
        minOrderValue: 0,
        maxDiscountAmount: 0,
        expiryDate: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        handleCouponSubmit(formData);
        onClose();
        setFormData({
            code: '',
            discountType: 'flat',
            discountValue: '',
            minOrderValue: 0,
            maxDiscountAmount: 0,
            expiryDate: ''
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-xl font-display font-bold text-slate-900">Create New Coupon</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Coupon Code</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold uppercase"
                                placeholder="E.G. SAVE20"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Type</label>
                                <select
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                >
                                    <option value="flat">Flat Amount</option>
                                    <option value="percentage">Percentage</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Min Order Value (₹)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                value={formData.minOrderValue}
                                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                            />
                        </div>
                        {formData.discountType === 'percentage' && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Max Discount Amount (₹)</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                    value={formData.maxDiscountAmount}
                                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Expiry Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-full py-4 text-lg mt-4 shadow-xl shadow-primary-200">
                        Create Coupon
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

const OrderDetailsModal = ({
    isOpen,
    onClose,
    selectedOrder,
    handleStatusChange,
    handleDeleteOrder,
    handleDownload,
    getStatusColor
}) => {
    if (!isOpen || !selectedOrder) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-display font-bold text-slate-900">
                            Order Details #{selectedOrder.orderId}
                        </h3>
                        <p className="text-xs text-slate-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8">
                    {/* Customer & Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</label>
                            <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                            <p className="text-sm text-slate-500">{selectedOrder.mobile}</p>
                            <p className="text-sm text-slate-500">{selectedOrder.email}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shipping Address</label>
                            <p className="text-sm text-slate-600 leading-relaxed">{selectedOrder.address}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Summary</label>
                            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                                {selectedOrder.subtotal && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Subtotal</span>
                                        <span className="font-bold text-slate-700">₹{selectedOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                )}
                                {selectedOrder.discountAmount > 0 && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Discount ({selectedOrder.couponCode})</span>
                                        <span className="font-bold text-green-600">- ₹ {selectedOrder.discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                    <span className="text-sm font-bold text-slate-800">Total Paid</span>
                                    <span className="font-black text-xl text-primary-600">₹{selectedOrder.totalPrice?.toFixed(2)}</span>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <span className="px-2 w-fit py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700">{selectedOrder.paymentMethod || 'Prepaid'}</span>
                                    <span className={`px-2 w-fit py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${selectedOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{selectedOrder.paymentStatus}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Order Items ({selectedOrder.items?.length || 1})</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {(selectedOrder.items?.length > 0 ? selectedOrder.items : [{
                                productName: selectedOrder.productId?.name,
                                size: selectedOrder.productDetails?.size,
                                material: selectedOrder.productDetails?.material,
                                artStyle: selectedOrder.productDetails?.artStyle,
                                quantity: selectedOrder.productDetails?.quantity,
                                uploadedImage: selectedOrder.uploadedImage
                            }]).map((item, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row gap-6 p-4 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all">
                                    <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                                        <img src={getImageUrl(item.uploadedImage)} className="w-full h-full object-cover" alt="User upload" />
                                    </div>
                                    <div className="flex-grow space-y-2">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-bold text-slate-800 text-lg">{item.productName || 'Order Product'}</h5>
                                            <div className="flex gap-2">
                                                <a
                                                    href={getImageUrl(item.uploadedImage)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-secondary p-2 rounded-lg"
                                                    title="View Full Image"
                                                >
                                                    <Eye size={18} />
                                                </a>
                                                <button
                                                    onClick={() => handleDownload(getImageUrl(item.uploadedImage), `${selectedOrder.customerName.replace(/\s+/g, '-').toLowerCase()}-${idx + 1}.jpg`)}
                                                    className="btn btn-primary p-2 rounded-lg"
                                                    title="Download Photo"
                                                >
                                                    <Download size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Size</span>
                                                <span className="font-medium text-slate-700">{item.size}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Finish</span>
                                                <span className="font-medium text-slate-700">{item.material}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Art Style</span>
                                                <span className="font-medium text-slate-700">{item.artStyle || 'Normal'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                                                <span className="font-medium text-slate-700">{item.quantity}</span>
                                            </div>
                                        </div>
                                        {(item.personalMessage || item.instructions) && (
                                            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {item.personalMessage && (
                                                    <div className="bg-primary-50/50 p-2 rounded-lg">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 block mb-1">Personal Message</span>
                                                        <p className="text-xs text-slate-700 italic">"{item.personalMessage}"</p>
                                                    </div>
                                                )}
                                                {item.instructions && (
                                                    <div className="bg-amber-50/50 p-2 rounded-lg">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mb-1">Special Instructions</span>
                                                        <p className="text-xs text-slate-700">{item.instructions}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-slate-900 transition-all"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => handleDeleteOrder(selectedOrder._id)}
                        className="px-6 py-2 rounded-xl text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Delete Order
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const navigate = useNavigate();

    // Coupons State
    const [coupons, setCoupons] = useState([]);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

    useEffect(() => {
        if (activeTab === 'orders' || activeTab === 'dashboard') {
            fetchOrders();
        } else if (activeTab === 'products') {
            fetchProducts();
        } else if (activeTab === 'coupons') {
            fetchCoupons();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderAPI.getAll();
            setOrders(response.data.data);
        } catch (error) {
            console.error('Fetch orders error:', error);
            toast.error('Failed to load orders. Please login again.');
            navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productAPI.getAll();
            setProducts(response.data.data);
        } catch (error) {
            console.error('Fetch products error:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await couponAPI.getAll();
            setCoupons(response.data.data);
        } catch (error) {
            console.error('Fetch coupons error:', error);
            toast.error('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderAPI.updateStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders(); // Refresh list
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await productAPI.delete(id);
            toast.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleDeleteOrder = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        try {
            await orderAPI.delete(id);
            toast.success('Order deleted successfully');
            fetchOrders();
        } catch (error) {
            toast.error('Failed to delete order');
        }
    };

    const handleCouponSubmit = async (data) => {
        try {
            await couponAPI.create(data);
            toast.success('Coupon created successfully!');
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create coupon');
        }
    };

    const handleDeleteCoupon = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        try {
            await couponAPI.delete(id);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename || 'order-image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download error:', error);
            window.open(url, '_blank');
            toast.info('Opened in new tab (Download blocked by browser)');
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const sizes = formData.get('sizes_input')?.split(',').map(s => s.trim()).filter(s => s) || [];
        const materials = formData.get('materials_input')?.split(',').map(m => m.trim()).filter(m => m) || [];
        const useGlobalPricing = formData.get('useGlobalPricing') === 'on';

        formData.append('options', JSON.stringify({ sizes, materials }));
        formData.set('useGlobalPricing', useGlobalPricing);

        formData.delete('sizes_input');
        formData.delete('materials_input');

        try {
            if (editingProduct) {
                await productAPI.update(editingProduct._id, formData);
                toast.success('Product updated successfully');
            } else {
                await productAPI.create(formData);
                toast.success('Product created successfully');
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
            setPreviewImages([]);
            fetchProducts();
        } catch (error) {
            console.error('Submit error:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0).toFixed(2)}`,
            icon: <DollarSign />, trend: '+12.5%', color: 'bg-emerald-50 text-emerald-600'
        },
        {
            label: 'Total Orders',
            value: orders.length,
            icon: <ShoppingBag />, trend: '+5.2%', color: 'bg-primary-50 text-primary-600'
        },
        {
            label: 'In Production',
            value: orders.filter(o => ['Received', 'In Design', 'Printing'].includes(o.status)).length,
            icon: <Package />, trend: '+8.1%', color: 'bg-accent-50 text-accent-600'
        },
        {
            label: 'Customers',
            value: [...new Set(orders.map(o => o.mobile))].length,
            icon: <Users />, trend: '+2.4%', color: 'bg-amber-50 text-amber-600'
        },
    ];

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded overflow-hidden">
                        <img
                            src="/logo.png"
                            alt="F"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="font-display font-bold text-slate-900 text-lg">AdminPanel</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
                    <X size={20} className="text-slate-500" />
                </button>
            </div>
            <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: <Sidebar size={18} /> },
                    { id: 'orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
                    { id: 'products', label: 'Products', icon: <Package size={18} /> },
                    { id: 'coupons', label: 'Coupons', icon: <Ticket size={18} /> },
                    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.id
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-slate-100">
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all">
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-white z-50 lg:hidden flex flex-col shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <div className="flex-grow">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 w-full">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden sm:flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-64 md:w-96">
                            <Search size={18} className="text-slate-400 flex-shrink-0" />
                            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-500">
                            <Bell size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-white shadow-sm">
                            AD
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-[1280px] mx-auto w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 capitalize">{activeTab} Overview</h1>
                            <p className="text-xs md:text-sm text-slate-500">Real-time data from your store.</p>
                        </div>
                        <div className="flex gap-3">
                            {activeTab === 'products' && (
                                <button
                                    onClick={() => setIsProductModalOpen(true)}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all"
                                >
                                    <Plus size={18} /> Add Product
                                </button>
                            )}
                            <button onClick={activeTab === 'products' ? fetchProducts : fetchOrders} className="btn-secondary px-4 py-2 flex items-center gap-2">
                                <Download size={16} /> Export
                            </button>
                        </div>
                    </div>

                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {stats.map((stat, idx) => (
                                <motion.div whileHover={{ y: -5 }} key={idx} className="card-premium p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color} shadow-sm`}>
                                            {stat.icon}
                                        </div>
                                    </div>
                                    <h4 className="text-slate-500 text-sm font-bold mb-1 uppercase tracking-wider">{stat.label}</h4>
                                    <p className="text-3xl font-display font-black text-slate-900">{stat.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary-600" /></div>
                    ) : activeTab === 'products' ? (
                        <div className="card-premium overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">All Products</h3>
                                <div className="flex gap-2">
                                    <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
                                        <Filter size={14} /> Filter
                                    </button>
                                </div>
                            </div>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Product</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Price</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {products.map((product) => (
                                            <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                                                            {product.images?.[0] && (
                                                                <img src={getImageUrl(product.images[0])} className="w-full h-full object-cover" alt={product.name} />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800 text-sm">{product.name}</span>
                                                            <span className="text-[10px] text-slate-400 truncate w-48">{product.description}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 font-bold text-slate-900 text-sm">
                                                    {product.useGlobalPricing ? 'Global Pricing' : `₹${product.price}`}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">Active</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-all"><Edit2 size={16} /></button>
                                                        <button onClick={() => handleDeleteProduct(product._id)} className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="md:hidden divide-y divide-slate-100">
                                {products.map((product) => (
                                    <div key={product._id} className="p-4 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                                {product.images?.[0] && <img src={getImageUrl(product.images[0])} className="w-full h-full object-cover" alt={product.name} />}
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <h4 className="font-bold text-slate-900 truncate">{product.name}</h4>
                                                <p className="text-xs text-primary-600 font-bold">₹{product.price}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center bg-slate-50/50 p-2 rounded-xl">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">Active</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteProduct(product._id)} className="p-2 bg-white border border-slate-200 text-rose-500 rounded-xl shadow-sm"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : activeTab === 'coupons' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Coupon Management</h3>
                                    <p className="text-sm text-slate-500 font-medium">Create and manage discount codes for your customers</p>
                                </div>
                                <button
                                    onClick={() => setIsCouponModalOpen(true)}
                                    className="px-6 py-3 bg-primary-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                                >
                                    <Plus size={18} /> New Coupon
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {coupons.map((coupon) => (
                                    <motion.div
                                        key={coupon._id}
                                        layout
                                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden group border-b-4 border-b-primary-500"
                                    >
                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 flex-shrink-0">
                                                <Ticket size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase font-display">{coupon.code}</h4>
                                                <p className="text-sm font-black text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg w-fit mt-1">
                                                    {coupon.discountType === 'flat' ? `₹${coupon.discountValue} Off` : `${coupon.discountValue}% Off`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 border-t border-slate-100 pt-5 mt-2">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-slate-400 uppercase tracking-widest text-[9px]">Min. Order</span>
                                                <span className="text-slate-800 text-sm font-black tracking-tight">₹{coupon.minOrderValue}</span>
                                            </div>
                                            {coupon.discountType === 'percentage' && (
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-400 uppercase tracking-widest text-[9px]">Max Discount</span>
                                                    <span className="text-slate-800 text-sm font-black tracking-tight">₹{coupon.maxDiscountAmount || 'No Limit'}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-slate-400 uppercase tracking-widest text-[9px]">Status</span>
                                                <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full ${coupon.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs font-bold pt-1">
                                                <span className="text-slate-400 uppercase tracking-widest text-[9px]">Expires</span>
                                                <span className="text-slate-800 text-sm font-bold tracking-tight">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {coupons.length === 0 && !loading && (
                                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-inner">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                            <Ticket size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-400 tracking-tight">No coupons found</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card-premium overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Recent Orders</h3>
                                <div className="flex gap-2">
                                    <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
                                        <Filter size={14} /> Filter
                                    </button>
                                </div>
                            </div>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Discount</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5 font-bold text-primary-600 text-sm">{order.orderId}</td>
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-slate-800 text-sm">{order.customerName}</div>
                                                    <div className="text-[10px] text-slate-400">{order.mobile}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer ${getStatusColor(order.status)}`}
                                                    >
                                                        {['Received', 'In Design', 'Printing', 'Ready', 'Delivered', 'Cancelled'].map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-5">
                                                    {order.discountAmount > 0 ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-emerald-600 font-bold text-sm">-₹{order.discountAmount}</span>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{order.couponCode}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 font-bold text-slate-900 text-sm">₹{order.totalPrice?.toFixed(2)}</td>
                                                <td className="px-6 py-5">
                                                    <button onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }} className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-xs font-bold hover:bg-primary-100 transition-all flex items-center gap-2">
                                                        <Eye size={14} /> View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="md:hidden divide-y divide-slate-100">
                                {orders.map((order) => (
                                    <div key={order._id} className="p-4 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs font-bold text-primary-600">#{order.orderId}</p>
                                                <h4 className="font-bold text-slate-900">{order.customerName}</h4>
                                            </div>
                                            <p className="font-black text-slate-900">₹{order.totalPrice?.toFixed(2)}</p>
                                        </div>
                                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider outline-none ${getStatusColor(order.status)}`}
                                            >
                                                {['Received', 'In Design', 'Printing', 'Ready', 'Delivered', 'Cancelled'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <button onClick={() => { setSelectedOrder(order); setIsOrderModalOpen(true); }} className="text-primary-600 font-bold text-xs">View Details</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {orders.length === 0 && (
                                <div className="p-20 text-center text-slate-400 font-bold">No orders found.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); setPreviewImages([]); }}
                editingProduct={editingProduct}
                previewImages={previewImages}
                setPreviewImages={setPreviewImages}
                handleProductSubmit={handleProductSubmit}
            />
            <OrderDetailsModal
                isOpen={isOrderModalOpen}
                onClose={() => { setIsOrderModalOpen(false); setSelectedOrder(null); }}
                selectedOrder={selectedOrder}
                handleStatusChange={handleStatusChange}
                handleDeleteOrder={handleDeleteOrder}
                handleDownload={handleDownload}
                getStatusColor={getStatusColor}
            />
            <CouponModal
                isOpen={isCouponModalOpen}
                onClose={() => setIsCouponModalOpen(false)}
                handleCouponSubmit={handleCouponSubmit}
            />
        </div>
    );
};

export default AdminDashboard;
