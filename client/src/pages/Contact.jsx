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
                                    <div className="w-12 h-12 rounded-xl bg-white flex-shrink-0 flex items-center justify-center text-primary-600 shadow-sm">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Email Us</h4>
                                        <p className="text-sm text-slate-500">flashback365@gmail.com</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-accent-50 border border-accent-100 flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex-shrink-0 flex items-center justify-center text-accent-600 shadow-sm">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Call Us</h4>
                                        <p className="text-sm text-slate-500">+91 94432 62643</p>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white flex-shrink-0 flex items-center justify-center text-slate-600 shadow-sm">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Visit Us</h4>
                                        <p className="text-sm text-slate-500">148, Palayamkottai Road, Opposite South Police Station, Toovipuram, Thoothukudi, Tamil Nadu 628001</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <h4 className="font-bold text-slate-900 mb-4">Quick Support</h4>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a href="https://wa.me/919443262643" target="_blank" rel="noopener noreferrer" className="btn bg-[#25D366] text-white flex-grow hover:opacity-90 transition-opacity">
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
                            <div className="rounded-3xl overflow-hidden h-80 bg-slate-100 relative border border-slate-200 shadow-inner">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3942.838211948646!2d78.1368686!3d8.8012661!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b03ef5c44e8052b%3A0xf5d36604ee49441c!2sflashback%20frames%20%26%20studio!5e0!3m2!1sen!2sin!4v1770716487227!5m2!1sen!2sin"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Flashback Frames Location"
                                ></iframe>
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
                                            <input type="text" placeholder="Vijay" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700">Last Name</label>
                                            <input type="text" placeholder="Kumar" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                                        <input type="email" placeholder="vijaykumar@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
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
