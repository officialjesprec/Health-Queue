import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { ArrowRight, Building, Users, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const HospitalRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { registerHospitalProfile } = useQueue();
  const [loading, setLoading] = useState(false);
  const [hospitalIdInput, setHospitalIdInput] = useState('');

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredHospital, setRegisteredHospital] = useState<any>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, { icon: '📋' });
  };

  // Form State
  const [form, setForm] = useState({
    name: '',
    location: '',
    fee: 2500,
    depts: 'OPD, Pharmacy, Lab'
  });

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalIdInput.trim()) return;
    navigate(`/admin/${hospitalIdInput.trim()}/login`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast.error('You must be logged in to register a hospital');
      navigate('/hospital/login?redirect=/register-hospital');
      return;
    }

    const deptsArray = form.depts.split(',').map(d => d.trim()).filter(Boolean);
    const defaultDepts = ['OPD', 'Pharmacy', 'Lab'];
    const finalDepts = deptsArray.length > 0 ? deptsArray : defaultDepts;

    const newHospital = {
      name: form.name,
      location: form.location,
      registration_fee: form.fee, // snake_case for DB
      departments: finalDepts,
      services: finalDepts.reduce((acc, d) => ({
        ...acc,
        [d]: [
          d === 'OPD' ? 'General Consultation' :
            d === 'Pharmacy' ? 'Drug Dispensing' :
              d === 'Lab' ? 'Blood Test' :
                `${d} Specialist Consultation`
        ]
      }), {}),
      is_open: true // snake_case for DB
    };

    try {
      const { data, error } = await supabase
        .from('hospitals')
        .insert(newHospital as any)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const hospital = data as any;

        // --- NEW: Automatically make the current user the Admin for this hospital ---
        const { error: staffError } = await supabase
          .from('staff')
          .insert({
            id: user.id,
            hospital_id: hospital.id,
            full_name: user.user_metadata?.full_name || 'Hospital Admin',
            role: 'admin',
            email: user.email
          } as any);

        if (staffError) {
          console.error('Failed to create admin staff record:', staffError);
        }

        // --- NEW: Automatically create a medical card/profile for the creator ---
        await registerHospitalProfile(hospital.id);

        setRegisteredHospital(hospital);
        toast.success('Hospital registered successfully!', { duration: 4000 });
        setShowSuccessModal(true);
        console.log('📧 Hospital ID:', hospital.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to register hospital');
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Unauthenticated View: Hospital Portal Landing
  // ------------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-healthcare-bg py-12 px-4 flex items-center justify-center">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-stretch animate-fade-in">

          {/* Left: New Hospital Registration */}
          <div className="bg-teal-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-32 bg-teal-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="w-14 h-14 bg-teal-700/50 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-teal-600">
                <Building className="w-7 h-7 text-teal-200" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Register Your Facility</h1>
              <p className="text-teal-200 text-lg mb-8 leading-relaxed">
                Transform your patient experience. efficient queue management, digital records, and happier patients.
              </p>

              <div className="space-y-4">
                <Link
                  to="/hospital/signup?redirect=/register-hospital"
                  className="block w-full py-4 bg-white text-teal-900 font-black text-center rounded-2xl hover:bg-teal-50 shadow-lg active:scale-[0.98] transition-all"
                >
                  Create Admin Account
                </Link>
                <div className="text-center">
                  <span className="text-teal-400 text-sm font-bold uppercase tracking-widest">Already have an account?</span>
                  <Link
                    to="/hospital/login?redirect=/register-hospital"
                    className="block mt-2 text-white font-bold hover:underline"
                  >
                    Sign In to Register
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-teal-800/50">
              <p className="text-xs text-teal-400 font-medium">
                * Requires verification. Account needed to manage sensitive hospital data.
              </p>
            </div>
          </div>

          {/* Right: Staff Login */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-slate-200 flex flex-col justify-center">
            <div className="mb-8">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-slate-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Staff Portal</h2>
              <p className="text-slate-500 font-medium">
                Access your hospital's dashboard. You'll need your Hospital ID.
              </p>
            </div>

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2 mb-1 block">Hospital ID</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 550e8400-e29b..."
                    className="w-full p-4 pl-12 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 font-mono text-slate-700"
                    value={hospitalIdInput}
                    onChange={(e) => setHospitalIdInput(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
              >
                Go to Staff Login
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 text-center bg-slate-50 p-4 rounded-xl">
              <p className="text-xs text-slate-500">
                Don't know your Hospital ID? <br />
                <span className="font-bold text-slate-700">Ask your hospital administrator for the direct login link.</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Authenticated View: Registration Form
  // ------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-slate-100">
        <div className="text-center mb-12 space-y-3">
          <div className="w-16 h-16 bg-teal-600 rounded-3xl mx-auto flex items-center justify-center text-white font-black text-2xl mb-6 shadow-xl shadow-teal-200">HQ</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Register Your Facility</h1>
          <p className="text-slate-500 font-bold text-lg max-w-sm mx-auto">Bring your hospital into the digital age and manage queues effortlessly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Hospital Legal Name</label>
              <input
                required
                className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Cedarcrest Hospitals"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">City & State</label>
              <input
                required
                className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Victoria Island, Lagos"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Medical Card Registration Fee (₦)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400">₦</span>
              <input
                type="number"
                required
                className="w-full p-5 pl-10 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-black text-slate-900 text-xl"
                value={form.fee}
                onChange={e => setForm({ ...form, fee: parseInt(e.target.value) })}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium ml-2 italic">Standard card fee for new patient folders.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Active Departments (Comma Separated)</label>
            <textarea
              className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-700 h-32 scrollbar-hide"
              value={form.depts}
              onChange={e => setForm({ ...form, depts: e.target.value })}
              placeholder="OPD, Dental, Lab, Antenatal, Surgery..."
            />
            <p className="text-[10px] text-slate-400 font-medium ml-2">We will automatically create basic booking pages for these sections.</p>
          </div>

          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl shadow-slate-300 hover:bg-teal-600 hover:shadow-teal-100 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Portal...' : 'Launch Hospital Portal'}
            </button>
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Your dedicated link will be generated instantly. <br /> Patients can start booking immediately.
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && registeredHospital && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-teal-600"></div>

            <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 scale-110 shadow-inner">
              <Building className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-slate-900 text-center mb-4 tracking-tight">Portal Launched!</h2>
            <p className="text-slate-500 text-sm font-medium text-center mb-8 px-4">
              Your hospital management system is now live. Share this unique ID with your staff to let them log in.
            </p>

            <div className="space-y-4 mb-10">
              <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 group relative">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[.25em] mb-2 text-center">Your Universal Hospital ID</p>
                <div className="flex flex-col items-center">
                  <p className="font-mono font-black text-lg md:text-xl text-teal-700 tracking-wider mb-4 break-all text-center">{registeredHospital.id}</p>
                  <button
                    onClick={() => copyToClipboard(registeredHospital.id, 'Hospital ID')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:text-teal-600 hover:border-teal-200 transition-all shadow-sm active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copy Hospital ID
                  </button>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Lock className="w-4 h-4 text-amber-700" />
                </div>
                <p className="text-[10px] font-bold text-amber-900 leading-normal">
                  <span className="block mb-1 text-xs">Security Warning:</span>
                  Save this ID immediately. It is required for all administrative access and cannot be retrieved easily if lost.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/admin/${registeredHospital.id}/dashboard`)}
              className="py-4 bg-teal-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-teal-100 hover:bg-teal-700 active:scale-95 transition-all flex items-center justify-center gap-2 w-full col-span-2"
            >
              Go to Hospital Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalRegistration;
