import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, ShoppingBag, DollarSign, Package,
    Search, Bell, MoreVertical, Edit2, Trash2,
    Download, Filter, Sidebar, Loader2, LogOut, Plus, X
} from 'lucide-react';
import { orderAPI, productAPI } from '../services/apiService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'orders' || activeTab === 'dashboard') {
            fetchOrders();
        } else if (activeTab === 'products') {
            fetchProducts();
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

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        // Structure options object
        const sizes = formData.get('sizes_input')?.split(',').map(s => s.trim()).filter(s => s) || [];
        const materials = formData.get('materials_input')?.split(',').map(m => m.trim()).filter(m => m) || [];
        formData.append('options', JSON.stringify({ sizes, materials }));

        // Remove individual inputs to avoid cluttering body
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
            value: `$${orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0).toFixed(2)}`,
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

    const ProductModal = () => (
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
                        onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                        className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleProductSubmit} className="p-8 space-y-6">
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
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="0.00"
                            />
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
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="8x10, 12x15, 20x24"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Materials (comma separated)</label>
                            <input
                                name="materials_input"
                                defaultValue={editingProduct?.options?.materials?.join(', ')}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                placeholder="Wood, Acrylic, Metal"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Images</label>
                        <input
                            name="images"
                            type="file"
                            multiple
                            accept="image/*"
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                        {editingProduct && <p className="text-[10px] text-amber-500 italic">Leave empty to keep existing images</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
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

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <div className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">F</div>
                        <span className="font-display font-bold text-slate-900">AdminPanel</span>
                    </div>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    {['Dashboard', 'Orders', 'Products', 'Customers'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveTab(item.toLowerCase())}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === item.toLowerCase()
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            {item === 'Dashboard' && <Sidebar size={18} />}
                            {item === 'Orders' && <ShoppingBag size={18} />}
                            {item === 'Products' && <Package size={18} />}
                            {item === 'Customers' && <Users size={18} />}
                            {item}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            <div className="flex-grow">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 w-96">
                        <Search size={18} className="text-slate-400" />
                        <input type="text" placeholder="Search orders..." className="bg-transparent border-none outline-none text-sm w-full" />
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

                <div className="p-8">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-slate-900 capitalize">{activeTab} Overview</h1>
                            <p className="text-slate-500">Real-time data from your store.</p>
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

                    <div className="card-premium overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                {activeTab === 'products' ? 'All Products' : 'Recent Orders'}
                            </h3>
                            <div className="flex gap-2">
                                <button className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
                                    <Filter size={14} /> Filter
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-primary-600" /></div>
                        ) : activeTab === 'products' ? (
                            <div className="overflow-x-auto">
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
                                                                <img
                                                                    src={getImageUrl(product.images[0])}
                                                                    className="w-full h-full object-cover"
                                                                    alt={product.name}
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-800 text-sm">{product.name}</span>
                                                            <span className="text-[10px] text-slate-400 truncate w-48">{product.description}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 font-bold text-slate-900 text-sm">${product.price}</td>
                                                <td className="px-6 py-5">
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">Active</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                                            className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product._id)}
                                                            className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Product</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {orders.map((order) => (
                                            <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-5 font-bold text-primary-600 text-sm">{order.orderId}</td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-800 text-sm">{order.customerName}</span>
                                                        <span className="text-[10px] text-slate-400">{order.mobile}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-slate-600">
                                                    {order.productId?.name || 'Deleted Product'}
                                                    <div className="text-[10px] text-slate-400">{order.productDetails?.size} | {order.productDetails?.material}</div>
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
                                                <td className="px-6 py-5 font-bold text-slate-900 text-sm">${order.totalPrice?.toFixed(2)}</td>
                                                <td className="px-6 py-5 text">
                                                    <div className="flex gap-2">
                                                        <a href={getImageUrl(order.uploadedImage)} target="_blank" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-all"><Edit2 size={16} /></a>
                                                        <button className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr><td colSpan="6" className="p-10 text-center text-slate-400">No orders found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                {isProductModalOpen && <ProductModal />}
            </div>
        </div>
    );
};

export default AdminDashboard;
