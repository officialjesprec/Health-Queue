
import React from 'react';
import { useQueue } from '../store/QueueContext';

const NotificationOverlay: React.FC = () => {
  const { notifications, dismissNotification } = useQueue();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-[100] pointer-events-none px-4 flex flex-col items-center space-y-3">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className="w-full max-w-md bg-slate-900 border-l-4 border-teal-500 p-5 rounded-2xl shadow-2xl pointer-events-auto animate-in slide-in-from-top-4 fade-in duration-500 group relative overflow-hidden"
        >
          {/* Pulse background effect */}
          <div className="absolute inset-0 bg-teal-500/10 animate-pulse pointer-events-none" />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-900/40">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-black text-sm uppercase tracking-widest">{notif.title}</h4>
                <p className="text-slate-400 text-xs font-bold leading-relaxed">{notif.message}</p>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest pt-1">HealthQueue Alert • Just Now</p>
              </div>
            </div>
            
            <button 
              onClick={() => dismissNotification(notif.id)}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Action button inside toast */}
          <div className="mt-4 flex justify-end relative z-10">
            <button 
              onClick={() => dismissNotification(notif.id)}
              className="bg-white/10 hover:bg-white/20 text-teal-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
            >
              Acknowledged
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationOverlay;
