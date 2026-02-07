
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MEDICAL_TERMS_SIMPLE } from '../constants';
import { useQueue } from '../store/QueueContext';
import InfoTooltip from '../components/InfoTooltip';

const BookingFlow: React.FC = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const { addQueueItem, user, registerUser, registerHospitalProfile, hospitals } = useQueue();
  
  const hospital = hospitals.find(h => h.id === hospitalId);
  const [step, setStep] = useState(1);
  const [customService, setCustomService] = useState('');
  
  // Registration data
  const [regForm, setRegForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    dob: '',
    gender: 'Other',
    address: '',
    kinName: '',
    kinRelation: '',
    kinPhone: ''
  });

  const [form, setForm] = useState({
    department: '',
    service: '',
    date: new Date().toISOString().split('T')[0],
    isEmergency: false,
    reason: ''
  });

  if (!hospital) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-2xl font-black text-slate-900">Hospital Not Found</h2>
        <p className="text-slate-500 mt-2">The hospital you are trying to book with is not in our system.</p>
        <button onClick={() => navigate('/')} className="mt-6 text-teal-600 font-bold">Back to Home</button>
      </div>
    );
  }

  const hasProfile = user?.profiles.some(p => p.hospitalId === hospital.id);

  const handleComplete = () => {
    const finalService = form.service === 'CUSTOM' ? customService : form.service;
    
    // Auto-register user basic info if not present
    if (!user) {
      registerUser({ fullName: regForm.fullName, phone: regForm.phone });
    }

    const item = addQueueItem({
      hospitalId: hospital.id,
      patientName: regForm.fullName || user?.fullName || 'Guest',
      phone: regForm.phone || user?.phone || 'Guest',
      department: form.department,
      service: finalService,
      isEmergency: form.isEmergency,
      timeSlot: 'ASAP',
      date: form.date,
      paymentStatus: 'Paid'
    });
    navigate(`/status/${item.id}`);
  };

  const handlePaymentAndReg = () => {
    registerHospitalProfile(hospital.id);
    registerUser({
      fullName: regForm.fullName,
      phone: regForm.phone,
      dateOfBirth: regForm.dob,
      gender: regForm.gender,
      address: regForm.address,
      nextOfKin: {
        name: regForm.kinName,
        relationship: regForm.kinRelation,
        phone: regForm.kinPhone
      }
    });
    setStep(5); // Go to confirm
  };

  const currentServices = hospital.services[form.department] || [];

  return (
    <div className="max-w-xl mx-auto py-4">
      <div className="mb-8 flex justify-between items-center px-2">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className="flex flex-col items-center flex-1 relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors ${step >= s ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {s}
            </div>
            {s < 5 && (
              <div className={`absolute left-[50%] top-4 h-[2px] w-full -z-0 ${step > s ? 'bg-teal-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 min-h-[450px] flex flex-col justify-between">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">Select Department</h2>
              <p className="text-sm text-slate-500">Choose the medical area for your visit at {hospital.name}</p>
            </div>
            <div className="grid gap-3">
              {hospital.departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => {
                    setForm({ ...form, department: dept });
                    setStep(2);
                  }}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all group/btn ${form.department === dept ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold block">{dept}</span>
                    <InfoTooltip term={dept} iconOnly />
                  </div>
                  {MEDICAL_TERMS_SIMPLE[dept] && (
                    <span className="text-xs text-slate-500 mt-0.5 block italic">{MEDICAL_TERMS_SIMPLE[dept]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">Which service do you need?</h2>
              <p className="text-sm text-slate-500">Pick what best describes your visit</p>
            </div>
            <div className="grid gap-3">
              {currentServices.map(svc => (
                <button
                  key={svc}
                  onClick={() => {
                    setForm({ ...form, service: svc });
                    setStep(3);
                  }}
                  className={`w-full p-4 text-left rounded-2xl border-2 transition-all ${form.service === svc ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold block">{svc}</span>
                    <InfoTooltip term={svc} iconOnly />
                  </div>
                  {MEDICAL_TERMS_SIMPLE[svc] && (
                    <span className="text-xs text-slate-500 mt-0.5 block italic">{MEDICAL_TERMS_SIMPLE[svc]}</span>
                  )}
                </button>
              ))}
              <div className={`w-full p-4 rounded-2xl border-2 transition-all ${form.service === 'CUSTOM' ? 'border-teal-500 bg-teal-50' : 'border-slate-100'}`}>
                <button onClick={() => setForm({...form, service: 'CUSTOM'})} className="w-full text-left font-bold text-slate-700 mb-2">I need something else...</button>
                {form.service === 'CUSTOM' && (
                  <input type="text" autoFocus className="w-full p-3 bg-white border border-teal-200 rounded-xl outline-none" value={customService} onChange={(e) => setCustomService(e.target.value)} placeholder="Explain in simple words" />
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 text-slate-500 font-bold">Back</button>
              <button disabled={form.service === 'CUSTOM' && !customService} onClick={() => setStep(3)} className="flex-[2] py-4 bg-teal-600 text-white font-bold rounded-2xl disabled:opacity-50">Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">When are you coming?</h2>
              <p className="text-sm text-slate-500">Select a date for your visit</p>
            </div>
            <div className="space-y-4">
              <input 
                type="date" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-teal-500 text-lg font-bold"
                value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({...form, date: e.target.value})}
              />
              <div className="p-4 rounded-2xl border transition-colors bg-slate-50 border-slate-100">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-5 h-5 text-red-600" checked={form.isEmergency} onChange={e => setForm({...form, isEmergency: e.target.checked})} />
                  <div className="flex-1">
                    <span className="font-bold text-slate-900">This is an emergency</span>
                    <p className="text-xs text-slate-500">Emergencies are only for today's visits.</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 text-slate-500 font-bold">Back</button>
              <button onClick={() => setStep(hasProfile ? 5 : 4)} className="flex-[2] py-4 bg-teal-600 text-white font-bold rounded-2xl">Continue</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-2 scrollbar-hide">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
              <h2 className="text-lg font-bold text-amber-900">Medical File Required</h2>
              <p className="text-sm text-amber-800">To be attended to at {hospital.name}, you need to open a medical file (Card fee: ₦{hospital.registrationFee}).</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Full Name</label>
                  <input className="w-full p-3 bg-slate-50 rounded-xl" value={regForm.fullName} onChange={e => setRegForm({...regForm, fullName: e.target.value})} placeholder="As on ID" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">Phone</label>
                  <input className="w-full p-3 bg-slate-50 rounded-xl" value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} placeholder="080..." />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400">DOB</label>
                  <input type="date" className="w-full p-3 bg-slate-50 rounded-xl" value={regForm.dob} onChange={e => setRegForm({...regForm, dob: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Address</label>
                  <input className="w-full p-3 bg-slate-50 rounded-xl" value={regForm.address} onChange={e => setRegForm({...regForm, address: e.target.value})} placeholder="Lagos, Nigeria" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 border-t pt-4">Next of Kin</h3>
              <div className="grid grid-cols-2 gap-3">
                <input className="col-span-2 w-full p-3 bg-slate-50 rounded-xl" value={regForm.kinName} onChange={e => setRegForm({...regForm, kinName: e.target.value})} placeholder="Relative Name" />
                <input className="w-full p-3 bg-slate-50 rounded-xl" value={regForm.kinRelation} onChange={e => setRegForm({...regForm, kinRelation: e.target.value})} placeholder="Relationship" />
                <input className="w-full p-3 bg-slate-50 rounded-xl" value={regForm.kinPhone} onChange={e => setRegForm({...regForm, kinPhone: e.target.value})} placeholder="Relative Phone" />
              </div>
            </div>
            <button 
              onClick={handlePaymentAndReg} 
              className="w-full py-5 bg-slate-900 text-white font-black rounded-3xl shadow-xl shadow-slate-200 mt-4 active:scale-95 transition-all"
            >
              Pay ₦{hospital.registrationFee} & Register
            </button>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Secured Payment</p>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900">Ready to Confirm?</h2>
            <div className="bg-slate-50 p-6 rounded-[2rem] text-left space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Hospital</span>
                <span className="font-bold text-slate-900">{hospital.name}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Appointment</span>
                <span className="font-bold text-slate-900">{form.department} - {form.service === 'CUSTOM' ? customService : form.service}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Date</span>
                <span className="font-bold text-teal-600">{form.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Patient</span>
                <span className="font-bold text-slate-900">{regForm.fullName || user?.fullName}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(3)} className="flex-1 py-4 text-slate-500 font-bold">Back</button>
              <button onClick={handleComplete} className="flex-[2] py-4 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-100 active:scale-95 transition-all">Confirm Booking</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFlow;
