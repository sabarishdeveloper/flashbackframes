import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold text-lg">F</div>
                            <span className="text-xl font-display font-bold text-white">Flashback<span className="text-primary-500">Frames</span></span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Preserving your precious memories in premium frames and personalized gifts. Handcrafted with love.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-5">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/products" className="hover:text-primary-400 transition-colors">All Products</Link></li>
                            <li><Link to="/products?category=frames" className="hover:text-primary-400 transition-colors">Photo Frames</Link></li>
                            <li><Link to="/products?category=gifts" className="hover:text-primary-400 transition-colors">Customized Gifts</Link></li>
                            <li><Link to="/track" className="hover:text-primary-400 transition-colors">Track My Order</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-5">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Shipping Policy</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Returns & Refunds</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                            <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-5">Get in Touch</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex gap-3">
                                <MapPin size={18} className="text-primary-500 flex-shrink-0" />
                                <span>123 Gallery Street, Creative Hub, NY 10001</span>
                            </li>
                            <li className="flex gap-3">
                                <Phone size={18} className="text-primary-500 flex-shrink-0" />
                                <span>+1 (555) 000-1234</span>
                            </li>
                            <li className="flex gap-3">
                                <Mail size={18} className="text-primary-500 flex-shrink-0" />
                                <span>hello@flashbackframes.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
                    <p>© 2026 Flashback Frames. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
