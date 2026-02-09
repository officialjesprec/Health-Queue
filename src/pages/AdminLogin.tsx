
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AdminLogin: React.FC = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const { hospitals } = useQueue();
  const { signIn } = useAuth();
  const hospital = hospitals.find(h => h.id === hospitalId);

  if (!hospital) {
    return (
      <div className="max-w-md mx-auto py-20 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl mx-auto flex items-center justify-center mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 leading-tight">Hospital Portal Not Found</h1>
        <p className="text-slate-500 mt-2 font-medium">Please contact your system administrator for the correct link.</p>
        <Link to="/" className="mt-8 inline-block px-8 py-3 bg-slate-900 text-white font-black rounded-xl text-sm uppercase tracking-widest transition-all">
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 px-4 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 text-center space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-teal-50 rounded-3xl mx-auto flex items-center justify-center border-2 border-teal-100 shadow-inner">
            <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">Staff Portal</h1>
            <p className="text-teal-600 font-bold uppercase text-[10px] tracking-widest mt-1">{hospital.name}</p>
          </div>
        </div>

        <form className="space-y-4 text-left" onSubmit={async (e) => {
          e.preventDefault();
          const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
          const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

          try {
            const { error } = await signIn(email, password);
            if (error) throw error;

            // Verify staff access
            const { data: staff, error: staffError } = await supabase
              .from('staff')
              .select('role')
              .eq('hospital_id', hospitalId)
              .eq('id', (await supabase.auth.getUser()).data.user?.id)
              .single();

            if (staffError || !staff) {
              await supabase.auth.signOut();
              throw new Error('You are not authorized to access this hospital portal.');
            }

            navigate(`/admin/${hospitalId}/dashboard`);
          } catch (err: any) {
            toast.error(err.message || 'Login failed');
          }
        }}>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="admin@hospital.com"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 transition-all font-bold"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 transition-all font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all mt-4"
          >
            Access Dashboard
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed italic">
            "Authorized access only. All actions are logged under the {hospital.name} security protocol."
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
