import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff, UserSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffLogin: React.FC = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        email: '',
        staffId: '', // Expected format: HOSP-12345
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Verify Staff ID format (optional regex check)
            if (!/^[A-Z]{3}-\d{5}$/.test(form.staffId.toUpperCase())) {
                // Allow loose format for now, but ideally enforce strict
            }

            // 2. Authenticate User
            const { data: authData, error: authError } = await signIn(form.email, form.password);

            if (authError) throw authError;
            if (!authData.user) throw new Error('Authentication failed');

            // 3. Verify Staff ID matches the user record
            const { data, error: staffError } = await supabase
                .from('staff')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            const staffData = data as any; // Explicit cast to handle dynamic schema behavior

            if (staffError || !staffData) {
                await supabase.auth.signOut();
                throw new Error('No staff account found for this user.');
            }

            // check if entered staff ID matches (optional security step)
            if (staffData.staff_code && staffData.staff_code !== form.staffId) {
                await supabase.auth.signOut();
                throw new Error('Invalid Staff ID for this account.');
            }

            toast.success(`Welcome back, ${staffData.full_name}!`);
            navigate('/staff/dashboard');

        } catch (err: any) {
            console.error('Staff Login Error:', err);
            setError(err.message || 'Login failed');
            toast.error(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden">
                <div className="px-8 pt-8 pb-6 bg-teal-600 text-white text-center relative">
                    <Link to="/" className="absolute left-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <UserSquare className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">Staff Portal</h1>
                    <p className="text-teal-100 text-sm mt-1">Access your work schedule and patient queue</p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-1 block">Staff ID</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-6 flex items-center justify-center bg-slate-100 rounded text-xs font-mono font-bold text-slate-500 group-focus-within:bg-teal-50 group-focus-within:text-teal-600">ID</div>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-4 pl-14 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all font-mono text-slate-900 uppercase placeholder:normal-case"
                                        placeholder="SSS-12345"
                                        value={form.staffId}
                                        onChange={(e) => setForm({ ...form, staffId: e.target.value.toUpperCase() })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider ml-1 mb-1 block">Work Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all font-medium text-slate-900"
                                        placeholder="nurse@hospital.com"
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
                                        className="w-full p-4 pl-12 pr-12 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-teal-500 focus:bg-white transition-all font-medium text-slate-900"
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
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In to Workstation'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-slate-500 text-sm">
                            Need help? <a href="#" className="text-teal-600 font-bold hover:underline">Contact IT Support</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffLogin;
