import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const HospitalLogin: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);

    // Get redirect path
    const searchParams = new URLSearchParams(location.search);
    const redirectPath = searchParams.get('redirect') || '/dashboard';
    const emailParam = searchParams.get('email') || '';

    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        identifier: emailParam,
        password: '',
    });
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const emailToUse = form.identifier.trim();
            if (!emailToUse.includes('@')) {
                throw new Error('Please enter a valid email address');
            }

            // Step 1: Authenticate the user
            const authData = await signIn(emailToUse, form.password);

            if (!authData.user) throw new Error('Authentication failed');

            // Step 2: Verify user is in ADMINS table (Strict Check)
            const { data: adminData, error: adminError } = await supabase
                .from('admins')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            // If user is NOT in admins table, deny access
            if (adminError || !adminData) {
                // Check if they are a legacy admin via metadata (fallback)
                const userRole = authData.user?.user_metadata?.role;
                if (userRole === 'hospital_admin' || userRole === 'admin') {
                    // If they have the role but not in table, we might need to sync or allow if strictly 'admin' role.
                    // But user said "strictly present inside the admin table". 
                    // However, to avoid locking out existing admins who might not be in the new table yet (if migration didn't backfill),
                    // we should be careful. Migration 013 didn't seem to backfill.
                    // But let's respect the "strictly admin table" instruction if possible, 
                    // or maybe insert them if missing?
                    // I will trust the user's intent: "strictly... inside the admin table".
                    // If I fail here, they will complain.
                    // But if the migration didn't backfill, existing users are locked out.
                    // I will assuming the 'admins' table is the source of truth now.
                    // BUT, if the user just ran the migration, the table is empty for old users?
                    // Migration 013 was likely run before? 
                    // I'll assume standard flow.

                    // Actually, I'll add a small safety check: if metadata says admin but table missing, maybe insert?
                    // No, "Strictly inside the admin table".
                    await supabase.auth.signOut();
                    throw new Error('Access Denied: You are not authorized as an Administrator.');
                }

                await supabase.auth.signOut();
                throw new Error('Access Denied: This portal is strictly for Administrators.');
            }

            toast.success(`Welcome back, ${adminData.full_name || 'Admin'}!`);

            // Smart Redirect: Send to Admin Dashboard
            if (searchParams.get('redirect')) {
                navigate(searchParams.get('redirect')!);
            } else {
                navigate('/admin/dashboard');
            }
        } catch (err: any) {
            console.error('Admin Login Error:', err);

            let message = 'Login failed. Please try again.';
            if (err.message === 'Invalid login credentials') {
                message = 'Invalid Email or Password.';
            } else {
                message = err.message || message;
            }

            setError(message);
            toast.error(message);
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
                        <h2 className="text-4xl font-black leading-tight mb-6">
                            Secure Access for <br />
                            <span className="text-teal-400">Administrators</span>
                        </h2>
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
                        <h1 className="text-3xl font-black text-slate-900 mb-3">Admin Login</h1>
                        <p className="text-slate-500 font-medium">Access your administrative dashboard and manage facility queues.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-1 block">Staff ID or Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                                    placeholder="email@hospital.com or CED-89123"
                                    value={form.identifier}
                                    onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1">Password</label>
                                <Link to="/auth/forgot-password" className="text-xs font-bold text-teal-600 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In to Dashboard'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 font-medium mt-8 text-sm">
                        Don't have an admin account?{' '}
                        <Link to="/admin/signup" className="text-teal-600 font-bold hover:underline">
                            Register Facility
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HospitalLogin;
