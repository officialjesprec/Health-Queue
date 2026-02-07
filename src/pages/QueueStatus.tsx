
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';
import { JourneyStage, QueueStatus as QStatusType } from '../types';
import { MEDICAL_TERMS_SIMPLE } from '../constants';
import InfoTooltip from '../components/InfoTooltip';
import QRCodeGenerator from '../components/QRCodeGenerator';

const QueueStatus: React.FC = () => {
  const { ticketId } = useParams();
  const { queue, user } = useQueue();
  const [showShareToast, setShowShareToast] = useState(false);
  const item = queue.find(q => q.id === ticketId);

  if (!item) return <div className="text-center p-12">Ticket not found. Check the link.</div>;

  const getPosition = () => {
    const deptQueue = queue.filter(q => q.hospitalId === item.hospitalId && q.department === item.department && q.status !== QStatusType.COMPLETED);
    const index = deptQueue.findIndex(q => q.id === item.id);
    return index + 1;
  };

  const stages = Object.values(JourneyStage);
  const currentStageIndex = stages.indexOf(item.stage);

  const getStatusConfig = () => {
    if (item.status === QStatusType.PENDING) return { color: 'bg-slate-500', label: 'Pending Approval', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' };
    if (item.status === QStatusType.UPCOMING) return { color: 'bg-indigo-600', label: 'Upcoming Booking', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z' };
    if (item.isEmergency) return { color: 'bg-red-600', label: 'Priority Emergency', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' };
    if (item.status === QStatusType.DELAYED) return { color: 'bg-amber-500', label: 'Queue Delayed', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' };
    return { color: 'bg-teal-600', label: 'Live Tracking', icon: 'M13 10V3L4 14h7v7l9-11h-7z' };
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/caregiver/${item.id}`;
    navigator.clipboard.writeText(shareUrl);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const config = getStatusConfig();

  return (
    <div className="max-w-md mx-auto space-y-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4">
          Caregiver Link Copied!
        </div>
      )}

      {/* Important Instruction: Screenshot */}
      <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-[2rem] shadow-sm flex items-start space-x-4">
        <div className="w-10 h-10 bg-amber-400 text-white rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Action Required:</p>
          <p className="text-xs font-bold text-amber-800 leading-relaxed">
            Please <span className="underline decoration-2 underline-offset-2">TAKE A SCREENSHOT</span> of this screen right now. You will need to show this QR code at the hospital gate even if you have no internet.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 pb-8">
        <div className={`${config.color} p-10 text-center text-white transition-colors duration-500 relative`}>
          <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Patient Check-in Token</p>
          <div className="relative inline-block mb-6 group">
            <div className="absolute inset-0 bg-white blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <QRCodeGenerator value={item.ticketId} size={180} />
          </div>
          <h1 className="text-5xl font-black mb-3 tracking-tighter">{item.ticketId}</h1>
          <div className="inline-flex items-center px-6 py-2 bg-black/20 rounded-full text-[11px] font-black backdrop-blur-md uppercase tracking-[0.1em]">
            {config.label}
          </div>
        </div>

        <div className="p-8 space-y-10">
          <button 
            onClick={handleShare}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl flex items-center justify-center space-x-3 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-xs font-black uppercase tracking-widest">Share Queue Status with Caregiver</span>
          </button>

          <div className="bg-slate-50 p-6 rounded-[2rem] text-center border border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Facility Service</p>
            <div className="flex items-center justify-center space-x-2">
              <p className="text-xl font-black text-slate-800 tracking-tight">{item.service}</p>
              <InfoTooltip term={item.service} iconOnly />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{item.date}</p>
          </div>

          {!user && (
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-8 rounded-[2.5rem] text-center space-y-4 shadow-xl shadow-teal-100">
              <h3 className="text-lg font-black text-white leading-tight">Create a Profile <br/> to save your booking</h3>
              <p className="text-teal-100 text-[11px] font-medium leading-relaxed">By creating an account, you can access your queue status and medical card from any phone, anytime.</p>
              <Link 
                to="/dashboard" 
                className="block w-full py-4 bg-white text-teal-700 text-xs font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-lg"
              >
                Register My Profile
              </Link>
            </div>
          )}

          {item.status === QStatusType.PENDING ? (
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-center border border-slate-800 shadow-xl shadow-slate-200">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow">
                <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-white font-black tracking-tight">Awaiting Hospital Approval</p>
              <p className="text-xs text-slate-400 mt-2 font-medium">The medical team has received your request. Check back in a few minutes for confirmation.</p>
            </div>
          ) : item.status !== QStatusType.UPCOMING ? (
            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner">
              <div className="text-center flex-1 border-r-2 border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em] mb-1">Position</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{getPosition()}</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em] mb-1">Estimated Wait</p>
                <p className={`text-3xl font-black tracking-tighter ${item.status === QStatusType.DELAYED ? 'text-amber-600' : 'text-slate-900'}`}>
                  ~{getPosition() * 15}m
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50 p-8 rounded-[2.5rem] text-center border-2 border-indigo-100 shadow-inner">
              <p className="text-indigo-900 font-black text-lg tracking-tight">Future Appointment Set</p>
              <p className="text-xs text-indigo-700 mt-2 font-medium leading-relaxed">You are confirmed for {item.date}. Please show this token to staff upon arrival on that day.</p>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] px-2">Patient Journey Map</h3>
            <div className="relative">
              <div className="absolute left-[1.125rem] top-0 bottom-0 w-1 bg-slate-100 rounded-full" />
              <div className="space-y-8 relative">
                {stages.map((stage, idx) => {
                  const isDone = idx < currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div key={stage} className="flex items-start space-x-6">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center z-10 shadow-lg transition-all duration-500 border-2 ${isDone ? 'bg-emerald-500 border-emerald-400 text-white' : isCurrent ? 'bg-teal-600 border-teal-500 text-white scale-110 ring-8 ring-teal-50' : 'bg-white border-slate-100 text-slate-300'}`}>
                        {isDone ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        ) : (
                          <span className="text-xs font-black">{idx + 1}</span>
                        )}
                      </div>
                      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCurrent ? 'p-5 bg-teal-50/50 rounded-3xl border border-teal-100' : 'py-2'}`}>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className={`font-black text-sm uppercase tracking-widest ${isDone ? 'text-slate-400' : isCurrent ? 'text-teal-900' : 'text-slate-300'}`}>{stage}</span>
                            <InfoTooltip term={stage} iconOnly className={isCurrent ? '' : 'opacity-20'} />
                          </div>
                          {isCurrent && <span className="text-[9px] font-black text-teal-600 bg-white px-2 py-0.5 rounded-full border border-teal-100 uppercase tracking-widest">Active</span>}
                        </div>
                        {isCurrent && MEDICAL_TERMS_SIMPLE[stage] && (
                          <span className="text-[11px] text-teal-700/80 mt-2 font-medium leading-relaxed italic">"{MEDICAL_TERMS_SIMPLE[stage]}"</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;
