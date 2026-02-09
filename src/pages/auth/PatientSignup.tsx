import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Lock, Phone, AlertCircle, Loader2, Calendar, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const PatientSignup: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signUp } = useAuth();
    const [loading, setLoading] = useState(false);

    // Get redirect path
    const searchParams = new URLSearchParams(location.search);
    const redirectPath = searchParams.get('redirect') || '/dashboard';

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        gender: '',
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
            await signUp(form.email, form.password, {
                fullName: form.fullName,
                phone: form.phone,
                dateOfBirth: form.dateOfBirth,
                gender: form.gender,
            });
            toast.success('Account created! Please check your email to verify.');

            // If redirect is present, send them to login with the redirect param
            // Logic: Signup -> Verify Email -> Login -> Redirect
            // Or if auto-login, go directly. For now, we usually require email verification in Supabase.
            // But we can forward the redirect param.
            if (redirectPath !== '/dashboard') {
                navigate(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`);
            } else {
                navigate('/auth/login');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
            toast.error('Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-healthcare-bg flex flex-col items-center justify-center p-4 py-12">
            <div className="w-full max-w-2xl">
                {/* Back Link */}
                <div className="mb-6">
                    <Link to="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                </div>

                <div className="card shadow-xl border-t-4 border-t-green-500">
                    <div className="text-center mb-8 pt-2">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Your Account</h1>
                        <p className="text-slate-500">Join thousands using HealthQueue to save time</p>
                    </div>

                    {error && (
                        <div className="alert-error mb-6 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label label-required">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        className="input !pl-14"
                                        placeholder="John Doe"
                                        value={form.fullName}
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label label-required">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="tel"
                                        required
                                        className="input !pl-14"
                                        placeholder="+234 800 123 4567"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="label label-required">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="input !pl-14"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">Date of Birth</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type="date"
                                        className="input !pl-14"
                                        value={form.dateOfBirth}
                                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Gender</label>
                                <select
                                    className="input"
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label label-required">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="input !pl-14 pr-10"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                            </div>

                            <div>
                                <label className="label label-required">Confirm Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        className="input !pl-14 pr-10"
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                            <p className="text-sm text-slate-600">
                                I agree to the{' '}
                                <Link to="/terms" className="text-primary-600 font-semibold hover:underline">
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link to="/privacy" className="text-primary-600 font-semibold hover:underline">
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-600 text-sm">
                            Already have an account?{' '}
                            <Link to="/auth/login" className="text-primary-600 font-bold hover:text-primary-700 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-8">
                    &copy; 2026 HealthQueue. Secure Verification.
                </p>
            </div>
        </div>
    );
};

export default PatientSignup;
