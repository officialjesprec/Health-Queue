import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, Clock, Bell, Shield, Heart } from 'lucide-react';
import { Logo } from '../components/Logo';

const Landing: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-healthcare-bg">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container-custom py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2">
                            <Logo variant="full" width={48} height={48} showText={true} />
                        </Link>
                        <div className="flex items-center gap-4">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/auth/login" className="btn-ghost">Sign In</Link>
                                    <Link to="/auth/signup" className="btn-primary">Get Started</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
                                    <Link to="/hospitals" className="btn-primary">Book Now</Link>
                                </>
                            )}
                            <Link to="/partner" className="text-sm font-bold text-slate-500 hover:text-teal-600 ml-2">For Hospitals</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 animate-fade-in">
                            <div className="inline-block px-4 py-2 bg-success-100 text-success-700 rounded-full text-sm font-semibold">
                                🎉 Now serving 10,000+ patients monthly
                            </div>
                            <h1 className="text-6xl font-black text-primary-900 leading-tight">
                                Healthcare Without The <span className="text-success-600">Waiting</span>
                            </h1>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                Book appointments instantly, track your queue position in real-time, and receive notifications when it's your turn. Healthcare made simple.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <Link to={isAuthenticated ? "/hospitals" : "/auth/signup"} className="btn-primary btn-lg group">
                                    {isAuthenticated ? "Book Appointment" : "Get Started Free"}
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/how-it-works" className="btn-outline btn-lg">
                                    How It Works
                                </Link>
                            </div>
                        </div>
                        <div className="relative animate-slide-up">
                            <div className="w-full h-96 bg-gradient-to-br from-primary-200 to-success-200 rounded-3xl shadow-2xl"></div>
                            <div className="absolute top-10 left-10 bg-white p-6 rounded-2xl shadow-xl">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-success-500 rounded-full"></div>
                                    <span className="font-bold">Dr. Sarah Johnson</span>
                                </div>
                                <p className="text-sm text-slate-600">Next available in 5 min</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-primary-900 mb-4">Why Patients Love Us</h2>
                        <p className="text-xl text-slate-600">Everything you need for a seamless healthcare experience</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="card text-center hover-lift">
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Real-Time Queue</h3>
                            <p className="text-slate-600">See your exact position and estimated wait time, updated live</p>
                        </div>

                        <div className="card text-center hover-lift">
                            <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-success-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Smart Notifications</h3>
                            <p className="text-slate-600">Get SMS and email alerts when it's nearly your turn</p>
                        </div>

                        <div className="card text-center hover-lift">
                            <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-secondary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
                            <p className="text-slate-600">Book appointments in seconds, available 24/7</p>
                        </div>

                        <div className="card text-center hover-lift">
                            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                            <p className="text-slate-600">Your health data is encrypted and HIPAA compliant</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary-600 text-white">
                <div className="container-custom text-center">
                    <h2 className="text-4xl font-black mb-6">Ready to skip the wait?</h2>
                    <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of Nigerians who are taking control of their healthcare experience
                    </p>
                    <Link to={isAuthenticated ? "/hospitals" : "/auth/signup"} className="btn-success btn-lg">
                        {isAuthenticated ? "Book Your First Appointment" : "Create Free Account"}
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12">
                <div className="container-custom">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Logo variant="icon" width={40} height={40} />
                            </div>
                            <p className="text-slate-400">Making healthcare accessible and efficient for everyone</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                                <li><Link to="/register-hospital" className="hover:text-white text-teal-400 font-bold">Register Hospital</Link></li>
                                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                                <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-slate-400">
                                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
                        <p>&copy; 2026 HealthQueue. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
