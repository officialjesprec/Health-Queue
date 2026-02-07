
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';
import { QueueStatus as QStatusType } from '../types';
import QRCodeGenerator from '../components/QRCodeGenerator';

const CaregiverView: React.FC = () => {
  const { ticketId } = useParams();
  const { queue, hospitals } = useQueue();
  const item = queue.find(q => q.id === ticketId);

  if (!item) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-black text-slate-900">Queue link expired or invalid</h2>
        <p className="text-slate-500 mt-2">Please ask the patient to share a new link.</p>
      </div>
    );
  }

  const hospital = hospitals.find(h => h.id === item.hospitalId);
  
  const getPosition = () => {
    const deptQueue = queue.filter(q => q.hospitalId === item.hospitalId && q.department === item.department && q.status !== QStatusType.COMPLETED);
    const index = deptQueue.findIndex(q => q.id === item.id);
    return index + 1;
  };

  const currentPatient = queue.find(q => q.hospitalId === item.hospitalId && q.department === item.department && q.status === QStatusType.IN_PROGRESS);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col">
      {/* Live Pulse Bar */}
      <div className="bg-slate-900 text-white py-3 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Caregiver Pulse</span>
        </div>
        <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="flex-1 p-6 space-y-6 animate-in fade-in duration-700">
        {/* Distance Warning */}
        <div className="bg-indigo-600 text-white p-5 rounded-[2rem] shadow-xl shadow-indigo-100 flex items-start space-x-4">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-black uppercase tracking-widest opacity-80">Proximity Alert</p>
            <p className="text-sm font-bold leading-tight">You are 5 minutes away from the ward. Please stay within walking distance.</p>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl text-center space-y-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tracking Ticket</p>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2">{item.ticketId}</h1>
            <p className="text-teal-600 font-black uppercase text-xs tracking-widest">{item.patientName}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Queue Position</p>
              <p className="text-4xl font-black text-slate-900">#{getPosition()}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Wait Time</p>
              <p className="text-4xl font-black text-slate-900">~{getPosition() * 15}m</p>
            </div>
          </div>

          <div className="p-6 bg-teal-50 rounded-[2.5rem] border border-teal-100">
            <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-1">Now Attending</p>
            <p className="text-2xl font-black text-teal-900 tracking-tight">
              {currentPatient ? currentPatient.ticketId : 'Calling Next...'}
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility</p>
            <p className="font-bold text-slate-900">{hospital?.name}</p>
            <p className="text-xs text-slate-500 font-medium">{item.department} — {item.service}</p>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <QRCodeGenerator value={item.ticketId} size={100} />
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-4">Sync ID: {item.id.toUpperCase()}</p>
          </div>
        </div>

        <div className="text-center pb-8">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">HealthQueue Caregiver Companion</p>
        </div>
      </div>
    </div>
  );
};

export default CaregiverView;
