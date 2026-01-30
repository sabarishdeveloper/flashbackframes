import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Send, ExternalLink } from 'lucide-react';

const Contact = () => {
    return (
        <div className="py-24 min-h-screen bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4">Contact Us</h1>
                        <p className="text-slate-500">We'd love to hear from you. Send us a message or visit our studio.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Contact Info */}
                        <div className="lg:col-span-5 space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                                <div className="p-6 rounded-2xl bg-primary-50 border border-primary-100 flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Email Us</h4>
                                        <p className="text-sm text-slate-500">hello@flashbackframes.com</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-accent-50 border border-accent-100 flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-accent-600 shadow-sm">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Call Us</h4>
                                        <p className="text-sm text-slate-500">+1 (555) 000-1234</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-600 shadow-sm">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Visit Us</h4>
                                        <p className="text-sm text-slate-500">123 Gallery Street, Creative Hub, NY 10001</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <h4 className="font-bold text-slate-900 mb-4">Quick Support</h4>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a href="#" className="btn bg-[#25D366] text-white flex-grow hover:opacity-90 transition-opacity">
                                        <MessageCircle size={20} className="mr-2" />
                                        WhatsApp
                                    </a>
                                    <a href="#" className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 flex-grow">
                                        <ExternalLink size={20} className="mr-2" />
                                        Help Center
                                    </a>
                                </div>
                            </div>

                            {/* Map Placeholder */}
                            <div className="rounded-3xl overflow-hidden h-64 bg-slate-100 relative group border border-slate-200">
                                <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-73.985,40.748,12,0/600x400?access_token=none')] bg-cover bg-center grayscale opacity-60 group-hover:grayscale-0 transition-all duration-700"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="p-3 bg-white rounded-full shadow-xl">
                                        <MapPin size={32} className="text-accent-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-7">
                            <div className="card-premium p-8 md:p-10">
                                <h3 className="text-2xl font-bold text-slate-900 mb-8">Send a Message</h3>
                                <form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">First Name</label>
                                            <input type="text" placeholder="John" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Last Name</label>
                                            <input type="text" placeholder="Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                                        <input type="email" placeholder="john@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Subject</label>
                                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all">
                                            <option>Order Inquiry</option>
                                            <option>Custom Request</option>
                                            <option>Bulk Order</option>
                                            <option>General Support</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Message</label>
                                        <textarea rows="5" placeholder="How can we help you?" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"></textarea>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-full py-4 text-lg">
                                        <Send size={20} className="mr-2" />
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
