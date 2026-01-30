import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/apiService';
import { toast } from 'sonner';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({
        email: '',
        password: ''
    });

    const handleInputChange = (e) => {
        setCredentials({ ...credentials, [e.target.type === 'email' ? 'email' : 'password']: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await authAPI.login(credentials);
            const { token } = response.data;
            localStorage.setItem('token', token);
            toast.success('Welcome Back, Administrator!');
            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl mb-6 transform -rotate-6">
                        <Camera size={40} />
                    </div>
                    <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Admin Portal</h2>
                    <p className="mt-2 text-slate-500">Welcome back, please login to manage orders</p>
                </div>

                <div className="card-premium p-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User size={18} />
                                </div>
                                <input
                                    required
                                    type="email"
                                    value={credentials.email}
                                    onChange={handleInputChange}
                                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="admin@flashback.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    required
                                    type="password"
                                    value={credentials.password}
                                    onChange={handleInputChange}
                                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary py-4 text-lg disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    Sign In
                                    <ArrowRight size={20} className="ml-2" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm text-slate-400">
                    Official Admin login only. Unauthorized access is monitored.
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
