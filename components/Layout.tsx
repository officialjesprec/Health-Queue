
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';
import NotificationOverlay from './NotificationOverlay';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { user } = useQueue();

  return (
    <div className="min-h-screen flex flex-col">
      <NotificationOverlay />
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-black">HQ</div>
            <span className="text-xl font-black text-slate-900 tracking-tight hidden sm:block">HealthQueue</span>
          </Link>
          <nav className="flex items-center space-x-4">
            {!isAdmin ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1.5 text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>{user ? 'My Profile' : 'Dashboard'}</span>
                </Link>
                <Link to="/admin/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-colors hidden md:block">
                  Staff Portal
                </Link>
              </>
            ) : (
              <Link to="/" className="text-sm font-bold text-slate-600 hover:text-teal-600 transition-colors">
                Patient View
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <div className="flex justify-center space-x-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Link to="/" className="hover:text-teal-600">Home</Link>
            <Link to="/dashboard" className="hover:text-teal-600">Dashboard</Link>
            <Link to="/admin/login" className="hover:text-teal-600">Staff</Link>
          </div>
          <p className="text-sm text-slate-400">© 2024 HealthQueue. Bridging the gap in African healthcare.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
