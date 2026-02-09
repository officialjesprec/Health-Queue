import React, { useEffect, useState } from 'react';
import { useQueue } from '../store/QueueContext';
import { useAuth } from '../hooks/useAuth';
import { QueueStatus } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Activity, Calendar, FileText,
  Thermometer, Heart, Droplet, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const PatientDashboard: React.FC = () => {
  const { queue, user, hospitals } = useQueue();
  const { signOut, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const myQueue = queue.filter(q => q.phone === user?.phone);

  const [patientId, setPatientId] = useState<string>('---');
  const [healthInfo, setHealthInfo] = useState({
    bloodGroup: 'O+',
    genotype: 'AA',
    allergies: 'None',
    weight: '70kg',
    height: '175cm'
  });
  const [isEditingHealth, setIsEditingHealth] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (!authLoading && !isAuthenticated) {
      // Add slight delay to handle race conditions
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          navigate('/auth/login?redirect=/dashboard');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchPatientProfile();
    }
  }, [user]);

  const fetchPatientProfile = async () => {
    try {
      // Explicitly selecting from patients table, handling possible error if table empty or no match
      const { data, error } = await supabase
        .from('patients')
        .select('patient_code, full_name')
        .eq('id', user?.id)
        .maybeSingle(); // Use maybeSingle to avoid 406 error if multiple rows (shouldn't happen with unique ID) or no rows

      if (data && (data as any).patient_code) {
        setPatientId((data as any).patient_code);
      } else {
        // Fallback/Simulation for demo if DB migration hasn't run for this user yet
        // Or if user just signed up and trigger hasn't fired/completed
        const randomId = 'HQ-' + Math.floor(10000 + Math.random() * 90000);
        setPatientId(randomId);
      }
    } catch (err) {
      console.error('Error fetching patient profile:', err);
      setPatientId('HQ-' + Math.floor(10000 + Math.random() * 90000));
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Hospital';

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-xl font-medium text-slate-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-teal-600"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-700 font-bold text-2xl border border-teal-100">
            {user?.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-slate-900">{user?.fullName || 'Guest'}</h1>
              <span className="bg-teal-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                Patient Portal
              </span>
            </div>
            <p className="text-slate-500 font-mono text-sm flex items-center gap-2">
              ID: <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded border border-slate-200">{patientId}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3 relative z-10 w-full md:w-auto">
          <Link to="/hospitals" className="flex-1 md:flex-none text-center bg-teal-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 hover:shadow-xl active:scale-95 transform duration-200">
            Book Appointment
          </Link>
          <button onClick={handleSignOut} className="bg-slate-50 text-slate-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors border border-slate-200">
            Sign Out
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Health Info & Stats */}
        <div className="space-y-6 lg:col-span-1">

          {/* Quick Stats - Moved up for visibility */}
          <div className="bg-gradient-to-br from-teal-900 to-teal-800 text-white rounded-3xl p-6 shadow-xl shadow-teal-900/20 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/20 rounded-full blur-xl"></div>

            <h2 className="text-lg font-bold mb-6 relative z-10 flex items-center gap-2 opacity-90">
              <Activity className="w-5 h-5 text-teal-300" />
              Activity Summary
            </h2>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-3 group hover:bg-white/5 p-2 rounded-lg transition-colors cursor-default">
                <span className="text-teal-100 text-sm font-medium">Active Bookings</span>
                <span className="text-2xl font-black bg-white/10 px-3 py-1 rounded-lg">{myQueue.filter(q => q.status !== QueueStatus.COMPLETED).length}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3 group hover:bg-white/5 p-2 rounded-lg transition-colors cursor-default">
                <span className="text-teal-100 text-sm font-medium">Hospitals Visited</span>
                <span className="text-2xl font-black bg-white/10 px-3 py-1 rounded-lg">{new Set(myQueue.map(q => q.hospitalId)).size}</span>
              </div>
              <div className="flex justify-between items-center group hover:bg-white/5 p-2 rounded-lg transition-colors cursor-default">
                <span className="text-teal-100 text-sm font-medium">Total Visits</span>
                <span className="text-2xl font-black bg-white/10 px-3 py-1 rounded-lg">{myQueue.filter(q => q.status === QueueStatus.COMPLETED).length}</span>
              </div>
            </div>
          </div>

          {/* Health Vitals Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Vital Info
              </h2>
              <button
                onClick={() => {
                  if (isEditingHealth) toast.success('Health profile updated')
                  setIsEditingHealth(!isEditingHealth)
                }}
                className="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors"
              >
                {isEditingHealth ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 mb-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <Droplet className="w-3 h-3 text-red-500" />
                  Blood Group
                </div>
                {isEditingHealth ? (
                  <select
                    value={healthInfo.bloodGroup}
                    onChange={(e) => setHealthInfo({ ...healthInfo, bloodGroup: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1 text-sm font-bold"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xl font-black text-slate-900">{healthInfo.bloodGroup}</p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 mb-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <Activity className="w-3 h-3 text-blue-500" />
                  Genotype
                </div>
                {isEditingHealth ? (
                  <select
                    value={healthInfo.genotype}
                    onChange={(e) => setHealthInfo({ ...healthInfo, genotype: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1 text-sm font-bold"
                  >
                    {['AA', 'AS', 'SS', 'AC'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xl font-black text-slate-900">{healthInfo.genotype}</p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2">
                <div className="flex items-center gap-1.5 mb-2 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  Allergies & Notes
                </div>
                {isEditingHealth ? (
                  <input
                    type="text"
                    value={healthInfo.allergies}
                    onChange={(e) => setHealthInfo({ ...healthInfo, allergies: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-medium outline-none focus:border-teal-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-900">{healthInfo.allergies}</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Appointments & History */}
        <div className="space-y-6 lg:col-span-2">

          {/* Test Results - Mocked */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-md font-black text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Latest Lab Results
              </h2>
              <button className="text-[10px] uppercase font-bold text-slate-400 hover:text-teal-600 transition-colors bg-slate-50 px-3 py-1.5 rounded-full">View All Records</button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Test Type</th>
                    <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Facility</th>
                    <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-wider">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-slate-700">Malaria Parasite (MP)</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">Feb 05, 2026</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">General Hospital</td>
                    <td className="px-5 py-4 text-right"><span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-1 rounded-md border border-green-200">NEGATIVE</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 text-sm font-bold text-slate-700">Full Blood Count (FBC)</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">Jan 22, 2026</td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">Lagoon Hospitals</td>
                    <td className="px-5 py-4 text-right"><span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-1 rounded-md border border-blue-200">READY</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-900 flex items-center">
                <Calendar className="w-5 h-5 mr-3 text-teal-600" />
                Appointment History
              </h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{myQueue.length} Total</span>
            </div>

            <div className="grid gap-4">
              {myQueue.length === 0 ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No appointments yet</h3>
                  <p className="text-slate-500 font-medium mb-6 max-w-xs mx-auto">Your journey to better health starts here. Book your first consultation today.</p>
                  <Link to="/hospitals" className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-colors transform hover:-translate-y-1">
                    Find a Hospital <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                myQueue.sort((a, b) => b.timestamp - a.timestamp).map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-teal-500 hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-5">
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-colors border ${item.status === QueueStatus.COMPLETED
                          ? 'bg-slate-50 text-slate-400 border-slate-100'
                          : 'bg-teal-50 text-teal-700 border-teal-100'
                          }`}>
                          <span className="text-[10px] uppercase opacity-60">Tick</span>
                          <span className="text-lg leading-none">{item.ticketId.split('-')[1]}</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{item.service}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                            <p className="font-medium text-slate-600 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                              {getHospitalName(item.hospitalId)}
                            </p>

                            {/* Mock Staff Attribution */}
                            {item.status === QueueStatus.COMPLETED && (
                              <p className="text-slate-400 text-xs flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Attended by <span className="font-bold text-slate-500">Dr. Sarah Smith</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col justify-between items-end gap-2 pl-16 md:pl-0">
                        <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">{item.date}</span>
                        <Link
                          to={`/status/${item.id}`}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${item.status === QueueStatus.COMPLETED
                            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-100'
                            }`}
                        >
                          {item.status === QueueStatus.COMPLETED ? 'View Receipt' : 'Track Status'}
                          {item.status !== QueueStatus.COMPLETED && <span className="animate-pulse">●</span>}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// ArrowRight was missing in imports, adding it here for the empty state
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default PatientDashboard;
