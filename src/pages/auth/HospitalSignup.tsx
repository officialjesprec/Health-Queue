import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Building, Mail, Lock, Phone, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const HospitalSignup: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signUp } = useAuth();
    const [loading, setLoading] = useState(false);

    // Get redirect path
    const searchParams = new URLSearchParams(location.search);
    const redirectPath = searchParams.get('redirect') || '/register-hospital';

    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        fullName: '', // This will be the Admin Name
        hospitalName: '', // Optional: Capture generic hospital name early
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            // Sign up the user
            const { error: signUpError } = await signUp(form.email, form.password, {
                fullName: form.fullName, // Admin Name
                phone: form.phone,
                role: 'hospital_admin', // Optional: Tag metadata for future use
                hospitalNameInitial: form.hospitalName
            });

            if (signUpError) throw signUpError;

            toast.success('Admin account created! Please sign in.');

            // Redirect to Login with the same redirect param
            navigate(`/hospital/login?redirect=${encodeURIComponent(redirectPath)}&email=${encodeURIComponent(form.email)}`);

        } catch (err: any) {
            console.error('Hospital Signup Error:', err);
            setError(err.message || 'Failed to create hospital account. Please try again.');
            toast.error(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-teal-900">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900 to-slate-900 opacity-90 z-10"></div>
                {/* Abstract Pattern */}
                <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

                <div className="relative z-20 flex flex-col justify-between p-16 text-white h-full">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/50">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tight">HealthQueue <span className="text-teal-400">Pro</span></span>
                        </div>
                        <h2 className="text-5xl font-black leading-tight mb-6">
                            Modernize Your <br />
                            <span className="text-teal-400">Healthcare Facility</span>
                        </h2>
                        <p className="text-lg text-slate-300 max-w-md leading-relaxed">
                            Join the network of top-tier hospitals using HealthQueue to streamline patient flow, reduce waiting times, and improve overall operational efficiency.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-sm font-medium text-teal-200">
                            <div className="w-12 h-1 bg-teal-500 rounded-full"></div>
                            Trusted by 50+ Medical Centers
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24 bg-white">
                <div className="max-w-md mx-auto w-full">
                    <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-600 mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>

                    <div className="mb-10">
                        <h1 className="text-3xl font-black text-slate-900 mb-3">Partner Registration</h1>
                        <p className="text-slate-500 font-medium">Create your administrative account to register your hospital.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-1 block">Administrator Name</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-4 pl-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                                        placeholder="Dr. John Doe / Admin Name"
                                        value={form.fullName}
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-1 block">Hospital Name (Draft)</label>
                                    <div className="relative group">
                                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                        <input
                                            type="text"
                                            className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                                            placeholder="Facility Name"
                                            value={form.hospitalName}
                                            onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-1 block">Work Phone</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                        <input
                                            type="tel"
                                            className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                                            placeholder="+234..."
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-1 block">Work Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                                        placeholder="admin@hospital.com"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-1 block">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full p-4 pl-12 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-1 block">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Admin Account'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 font-medium mt-8 text-sm">
                        Already have an account?{' '}
                        <Link to="/hospital/login" className="text-teal-600 font-bold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HospitalSignup;
