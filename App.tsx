
import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueueProvider, useQueue } from './store/QueueContext';
import Layout from './components/Layout';
import PatientHome from './pages/PatientHome';
import BookingFlow from './pages/BookingFlow';
import QueueStatus from './pages/QueueStatus';
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminLogin from './pages/AdminLogin';
import HospitalRegistration from './pages/HospitalRegistration';
import CaregiverView from './pages/CaregiverView';

const AdminSelector: React.FC = () => {
  const { hospitals } = useQueue();
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900">Hospital Portal Hub</h1>
        <p className="text-slate-500 font-medium">Select your facility to access the dedicated staff dashboard.</p>
      </div>
      <div className="grid gap-4">
        {hospitals.map(h => (
          <Link 
            key={h.id} 
            to={`/admin/${h.id}/login`}
            className="group bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between hover:border-teal-50 hover:border-teal-500 hover:shadow-xl transition-all"
          >
            <div className="text-left">
              <h3 className="font-black text-slate-900 text-xl group-hover:text-teal-600 transition-colors">{h.name}</h3>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{h.location}</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-teal-50">
              <svg className="w-6 h-6 text-slate-300 group-hover:text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </div>
          </Link>
        ))}
      </div>
      <div className="pt-6">
        <Link to="/register-hospital" className="inline-block text-teal-600 font-bold hover:underline">
          Or Register a New Hospital
        </Link>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueueProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Patient Routes */}
            <Route path="/" element={<PatientHome />} />
            <Route path="/book/:hospitalId" element={<BookingFlow />} />
            <Route path="/status/:ticketId" element={<QueueStatus />} />
            <Route path="/dashboard" element={<PatientDashboard />} />
            <Route path="/register-hospital" element={<HospitalRegistration />} />
            <Route path="/caregiver/:ticketId" element={<CaregiverView />} />

            {/* Hospital Specific Staff Routes */}
            <Route path="/admin/:hospitalId/login" element={<AdminLogin />} />
            <Route path="/admin/:hospitalId/dashboard" element={<AdminDashboard />} />

            {/* Generic Admin Selector */}
            <Route path="/admin/login" element={<AdminSelector />} />
          </Routes>
        </Layout>
      </Router>
    </QueueProvider>
  );
};

export default App;
