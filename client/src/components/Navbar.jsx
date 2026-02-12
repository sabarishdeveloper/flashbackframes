import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, User, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { getCartCount } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'Track Order', path: '/track' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3 shadow-md' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2">
                    <motion.div
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
                    >
                        F
                    </motion.div>
                    <span className={`text-xl font-display font-bold ${scrolled ? 'text-slate-900' : 'text-slate-800'}`}>
                        Flashback<span className="text-primary-600">Frames</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-sm font-medium transition-colors hover:text-primary-600 ${location.pathname === link.path ? 'text-primary-600' : scrolled ? 'text-slate-700' : 'text-slate-800'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-5">
                    <button className="p-2 text-slate-600 hover:text-primary-600 transition-colors">
                        <Search size={20} />
                    </button>
                    <Link to="/cart" className="p-2 text-slate-600 hover:text-primary-600 transition-colors relative">
                        <ShoppingCart size={20} />
                        {getCartCount() > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-accent-500 text-white text-[10px] flex items-center justify-center rounded-full">
                                {getCartCount()}
                            </span>
                        )}
                    </Link>

                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-slate-800"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
                    >
                        <div className="flex flex-col p-4 gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="text-lg font-medium py-2 text-slate-800 border-b border-slate-50"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="flex justify-between items-center py-4">
                                <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-slate-800">
                                    <ShoppingCart size={20} /> Cart ({getCartCount()})
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
