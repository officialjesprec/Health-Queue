import React, { useEffect } from 'react';
import { useQueue } from '../store/QueueContext';
import { useAuth } from '../hooks/useAuth';
import { QueueStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const PatientDashboard: React.FC = () => {
  const { queue, user, hospitals } = useQueue();
  const { signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const myQueue = queue.filter(q => q.phone === user?.phone);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login?redirect=/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Hospital';

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div className="bg-teal-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-teal-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-black mb-2">Hello, {user?.fullName || 'Guest'}</h1>
          <p className="text-teal-100 font-medium">Manage your hospital medical cards and appointments.</p>
          <button onClick={() => signOut()} className="text-xs font-bold text-teal-200 hover:text-white underline mt-2">
            Not you? Sign Out
          </button>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <p className="text-[10px] uppercase font-black tracking-widest mb-1">Active Bookings</p>
          <p className="text-4xl font-black">{myQueue.filter(q => q.status !== QueueStatus.COMPLETED).length}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Hospital Medical Cards
          </h2>
          <div className="grid gap-4">
            {(user?.profiles || []).length === 0 ? (
              <div className="bg-slate-100 p-8 rounded-3xl text-center border-2 border-dashed border-slate-200">
                <p className="text-slate-500 font-medium italic">You haven't registered with any hospitals yet.</p>
              </div>
            ) : (
              (user?.profiles || []).map(profile => (
                <div key={profile.hospitalId} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900">{getHospitalName(profile.hospitalId)}</h3>
                    <p className="text-xs font-mono text-teal-600 font-bold tracking-wider mt-1">ID: {profile.cardId}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-100">Active</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
            My Appointments
          </h2>
          <div className="grid gap-4">
            {myQueue.length === 0 ? (
              <Link to="/" className="block p-8 bg-slate-100 rounded-3xl text-center border-2 border-dashed border-slate-200 hover:border-teal-500 transition-colors">
                <p className="text-slate-500 font-medium">No bookings found. <br /><span className="text-teal-600 font-bold">Book an appointment now</span></p>
              </Link>
            ) : (
              myQueue.sort((a, b) => b.timestamp - a.timestamp).map(item => (
                <Link to={`/status/${item.id}`} key={item.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-teal-500 transition-all flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-900">
                    {item.ticketId.split('-')[1]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 leading-tight">{item.service}</h3>
                    <p className="text-xs text-slate-500">{getHospitalName(item.hospitalId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400">{item.date}</p>
                    <span className={`text-[9px] font-black uppercase ${item.status === QueueStatus.COMPLETED ? 'text-slate-400' : 'text-teal-600'}`}>
                      {item.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatientDashboard;
