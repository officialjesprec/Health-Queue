
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';

const HospitalRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { registerHospital } = useQueue();
  const [form, setForm] = useState({
    name: '',
    location: '',
    fee: 2500,
    depts: 'OPD, Pharmacy, Lab'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const deptsArray = form.depts.split(',').map(d => d.trim()).filter(Boolean);
    const newHospital = {
      id: `h-${Math.random().toString(36).substr(2, 5)}`,
      name: form.name,
      location: form.location,
      registrationFee: form.fee,
      departments: deptsArray.length > 0 ? deptsArray : ['OPD', 'Pharmacy', 'Lab'],
      // Auto-generate some basic services for each department for immediate functionality
      services: deptsArray.reduce((acc, d) => ({ 
        ...acc, 
        [d]: [
          d === 'OPD' ? 'General Consultation' : 
          d === 'Pharmacy' ? 'Drug Dispensing' : 
          d === 'Lab' ? 'Blood Test' : 
          `${d} Specialist Consultation`
        ] 
      }), {}),
      isOpen: true
    };
    registerHospital(newHospital);
    // Success redirect to the new hospital's portal login
    navigate(`/admin/${newHospital.id}/login`);
  };

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
                onChange={e => setForm({...form, name: e.target.value})}
                placeholder="e.g. Cedarcrest Hospitals"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">City & State</label>
              <input 
                required
                className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-900" 
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
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
                onChange={e => setForm({...form, fee: parseInt(e.target.value)})}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium ml-2 italic">Standard card fee for new patient folders.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Active Departments (Comma Separated)</label>
            <textarea 
              className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-teal-500 focus:bg-white transition-all font-bold text-slate-700 h-32 scrollbar-hide" 
              value={form.depts}
              onChange={e => setForm({...form, depts: e.target.value})}
              placeholder="OPD, Dental, Lab, Antenatal, Surgery..."
            />
            <p className="text-[10px] text-slate-400 font-medium ml-2">We will automatically create basic booking pages for these sections.</p>
          </div>

          <div className="pt-6 space-y-4">
            <button 
              type="submit"
              className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl shadow-slate-300 hover:bg-teal-600 hover:shadow-teal-100 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm"
            >
              Launch Hospital Portal
            </button>
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Your dedicated link will be generated instantly. <br/> Patients can start booking immediately.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HospitalRegistration;
