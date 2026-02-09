
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';
import { useAuth } from '../hooks/useAuth';
import { QueueStatus, JourneyStage, QueueItem, Hospital } from '../types';
import { HOSPITALS } from '../constants';
import { supabase } from '../lib/supabase';
import InfoTooltip from '../components/InfoTooltip';

import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated } = useAuth(); // Auth Hook
  const { queue, updateQueueItem, advanceQueue, addQueueItem, acceptBooking, hospitals } = useQueue();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState('OPD');
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInService, setWalkInService] = useState('');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  // Staff Creation State
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdStaff, setCreatedStaff] = useState<any>(null);
  const [staffCreating, setStaffCreating] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'nurse', password: '' });

  // Handle Copy to Clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, { icon: '📋' });
  };

  // Handle Staff Creation (using temporary client)
  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.password || !hospital) {
      toast.error('Please fill all fields');
      return;
    }

    setStaffCreating(true);
    try {
      // Generate Staff ID (HospitalPrefix-Random)
      const prefix = hospital.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
      const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
      const staffCode = `${prefix}-${randomNum}`; // e.g., CED-58392

      // Create Dummy Email for Auth
      // Using a consistent fake domain ensures we don't accidentally email real people
      const dummyEmail = `staff_${staffCode.toLowerCase()}_${Date.now()}@healthqueue.local`;

      // Create Temp Client for Auth Creation to avoid logging out the Admin
      const tempClient = createClient(
        (import.meta as any).env.VITE_SUPABASE_URL,
        (import.meta as any).env.VITE_SUPABASE_ANON_KEY
      );

      // Sign Up User (Creates auth.users record)
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: dummyEmail,
        password: newStaff.password,
        options: {
          data: {
            full_name: newStaff.name,
            role: newStaff.role,
            staff_code: staffCode,
            hospital_id: hospital.id
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Insert into Public Staff Table (using main Client)
        // Note: DB Trigger 010 prevents insertion into public.users
        // So we manually insert into public.staff here
        const { error: dbError } = await supabase
          .from('staff')
          .insert({
            id: authData.user.id,
            hospital_id: hospital.id,
            full_name: newStaff.name,
            role: newStaff.role,
            staff_code: staffCode,
            email: dummyEmail
          } as any);

        if (dbError) throw dbError;

        // Success Feedback
        const staffResult = {
          name: newStaff.name,
          code: staffCode,
          password: newStaff.password,
          email: dummyEmail
        };

        setCreatedStaff(staffResult);
        toast.success(`Staff Account Created!`, { duration: 4000, icon: '👨‍⚕️' });
        setShowStaffModal(false);
        setNewStaff({ name: '', role: 'nurse', password: '' });
        setShowSuccessModal(true);
      }

    } catch (error: any) {
      console.error('Staff creation failed:', error);
      toast.error(error.message || 'Failed to create staff account');
    } finally {
      setStaffCreating(false);
    }
  };

  // Fetch hospital data from Supabase
  useEffect(() => {
    const fetchHospital = async () => {
      if (!hospitalId || !user) {
        setHospitalLoading(false);
        return;
      }

      // Security Check: Verify user is an admin for THIS hospital
      try {
        const { data: staffCheck, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('id', user.id)
          .eq('hospital_id', hospitalId)
          .maybeSingle();

        if (staffError || !staffCheck || (staffCheck as any).role !== 'admin') {
          toast.error('Unauthorized access to this hospital dashboard');
          navigate('/dashboard');
          return;
        }
      } catch (err) {
        navigate('/dashboard');
        return;
      }

      // First, check if hospital data was passed via navigation state (from registration)
      const stateHospital = (location.state as any)?.hospital;
      if (stateHospital) {
        const mappedHospital: Hospital = {
          id: stateHospital.id,
          name: stateHospital.name,
          location: stateHospital.location,
          departments: stateHospital.departments || ['OPD'],
          services: stateHospital.services || {},
          registrationFee: stateHospital.registration_fee || 0,
          isOpen: stateHospital.is_open !== false,
        };
        setHospital(mappedHospital);
        setHospitalLoading(false);
        return;
      }

      // Second, try local context
      const localHospital = hospitals.find(h => h.id === hospitalId) || HOSPITALS.find(h => h.id === hospitalId);

      if (localHospital) {
        setHospital(localHospital);
        setHospitalLoading(false);
        return;
      }

      // If not in context, fetch from Supabase
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', hospitalId)
          .single();

        if (error) throw error;

        if (data) {
          // Map Supabase data to Hospital type
          const hospitalData = data as any;
          const mappedHospital: Hospital = {
            id: hospitalData.id,
            name: hospitalData.name,
            location: hospitalData.location,
            departments: hospitalData.departments || ['OPD'],
            services: hospitalData.services || {},
            registrationFee: hospitalData.registration_fee || 0,
            isOpen: hospitalData.is_open !== false,
          };
          setHospital(mappedHospital);
        }
      } catch (err) {
        console.error('Error fetching hospital:', err);
      } finally {
        setHospitalLoading(false);
      }
    };

    fetchHospital();
  }, [hospitalId, hospitals, location.state]);

  // Protect Route
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to specific admin login if we know the hospital ID
      navigate(`/admin/${hospitalId}/login`);
    }
  }, [isAuthenticated, navigate, hospitalId]);

  if (hospitalLoading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-600">Loading hospital information...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="p-12 text-center">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-8">
          <h2 className="text-xl font-black text-red-900 mb-2">Hospital Not Found</h2>
          <p className="text-red-700 font-medium mb-4">
            We couldn't find a hospital with this ID.
          </p>
          <button
            onClick={() => navigate('/register-hospital')}
            className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700"
          >
            Register a Hospital
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const filteredQueue = queue.filter(q => q.hospitalId === hospitalId && q.department === selectedDept && q.date === viewDate && q.status !== QueueStatus.PENDING);
  const pendingBookings = queue.filter(q => q.hospitalId === hospitalId && q.status === QueueStatus.PENDING);

  const isToday = viewDate === new Date().toISOString().split('T')[0];

  const stats = {
    waiting: filteredQueue.filter(q => q.status === QueueStatus.WAITING).length,
    active: filteredQueue.filter(q => q.status === QueueStatus.IN_PROGRESS).length,
    upcoming: queue.filter(q => q.hospitalId === hospitalId && q.status === QueueStatus.UPCOMING).length,
  };

  const handleUpdateStage = (item: QueueItem) => {
    const stages = Object.values(JourneyStage);
    const currentIndex = stages.indexOf(item.stage);
    if (currentIndex < stages.length - 1) {
      updateQueueItem(item.id, { stage: stages[currentIndex + 1] });
    } else {
      updateQueueItem(item.id, { status: QueueStatus.COMPLETED });
    }
  };

  const handleAddWalkIn = () => {
    if (!walkInName || !walkInService) return;
    addQueueItem({
      hospitalId: hospital.id,
      department: selectedDept,
      patientName: walkInName,
      service: walkInService,
      phone: 'Walk-in',
      isEmergency: false,
      timeSlot: 'Now',
      date: viewDate,
      paymentStatus: 'Paid'
    });
    // For walk-ins, we should auto-accept
    const lastItem = queue[queue.length - 1];
    if (lastItem) acceptBooking(lastItem.id);

    setWalkInName('');
    setWalkInService('');
    setShowWalkInModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{hospital.name}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Active Staff Portal - {selectedDept}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 flex items-center space-x-3 shadow-sm">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
            <input
              type="date"
              className="bg-transparent border-none outline-none text-sm font-bold text-slate-700"
              value={viewDate}
              onChange={(e) => setViewDate(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowWalkInModal(true)}
            className="px-4 py-2.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 flex items-center space-x-2 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            <span className="text-sm">New Entry</span>
          </button>
          {isToday && (
            <button
              onClick={() => advanceQueue(hospital.id, selectedDept)}
              className="px-4 py-2.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 flex items-center space-x-2 transition-all shadow-lg shadow-teal-100 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              <span className="text-sm">Call Next</span>
            </button>
          )}
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            <span className="text-sm">Add Staff</span>
          </button>
          <button
            onClick={() => {
              signOut();
              navigate(`/admin/${hospital.id}/login`);
            }}
            className="px-4 py-2.5 bg-red-50 text-red-600 font-black rounded-xl hover:bg-red-100 flex items-center space-x-2 transition-all border border-red-100"
          >
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Queue Waiting</p>
          <p className="text-4xl font-black text-slate-900">{stats.waiting}</p>
        </div>
        <div className="bg-teal-50 p-6 rounded-[2rem] border border-teal-100 shadow-sm">
          <p className="text-teal-600 text-[10px] font-black uppercase tracking-widest mb-1">In Session</p>
          <p className="text-4xl font-black text-teal-900">{stats.active}</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 shadow-sm">
          <p className="text-amber-600 text-[10px] font-black uppercase tracking-widest mb-1">Pending Approval</p>
          <p className="text-4xl font-black text-amber-900">{pendingBookings.length}</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 shadow-sm">
          <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-1">Upcoming</p>
          <p className="text-4xl font-black text-indigo-900">{stats.upcoming}</p>
        </div>
      </div>

      {/* Pending Approvals Section */}
      {pendingBookings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">New Booking Requests</h2>
          <div className="grid gap-4">
            {pendingBookings.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black">?</div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.patientName}</h3>
                    <p className="text-xs font-bold text-teal-600 uppercase tracking-tight">{item.service} — {item.date}</p>
                  </div>
                </div>
                <div className="flex space-x-2 w-full md:w-auto">
                  <button
                    onClick={() => updateQueueItem(item.id, { status: QueueStatus.COMPLETED })}
                    className="flex-1 px-4 py-2 text-red-600 text-[10px] font-black uppercase bg-red-50 rounded-xl"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => acceptBooking(item.id)}
                    className="flex-[2] px-6 py-2 bg-teal-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-teal-100"
                  >
                    Accept & Join Queue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex space-x-2 overflow-x-auto scrollbar-hide">
          {hospital.departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all whitespace-nowrap flex items-center space-x-2 border-2 ${selectedDept === dept ? 'bg-white border-teal-500 text-teal-600 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
            >
              <span>{dept}</span>
              <InfoTooltip term={dept} iconOnly className={selectedDept === dept ? '' : 'opacity-40'} />
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-8 py-5">Patient Details</th>
                <th className="px-6 py-5">Requested Service</th>
                <th className="px-6 py-5">Account Status</th>
                <th className="px-6 py-5">Journey Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-slate-400 font-bold italic">No active patients in {selectedDept} for this date.</p>
                  </td>
                </tr>
              )}
              {filteredQueue.map(item => (
                <tr key={item.id} className={`${item.isEmergency ? 'bg-red-50/40' : ''} hover:bg-slate-50/50 transition-colors group`}>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-slate-900 tracking-tighter text-base">{item.ticketId}</span>
                        {item.isEmergency && <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black rounded-lg uppercase tracking-widest">Urgent</span>}
                      </div>
                      <span className="text-sm font-bold text-slate-500 mt-1">{item.patientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-black text-teal-700">{item.service}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${item.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      Card {item.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="text-xs font-bold text-slate-700">{item.stage}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {isToday && item.status !== QueueStatus.COMPLETED && (
                      <button
                        onClick={() => handleUpdateStage(item)}
                        className="px-4 py-2 bg-white border-2 border-slate-100 text-slate-900 font-black text-[10px] uppercase rounded-xl shadow-sm"
                      >
                        Progress
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showWalkInModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Add Walk-in</h2>
            <div className="space-y-4">
              <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" placeholder="Patient Name" value={walkInName} onChange={e => setWalkInName(e.target.value)} />
              <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl" placeholder="Service" value={walkInService} onChange={e => setWalkInService(e.target.value)} />
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowWalkInModal(false)} className="flex-1 py-4 text-slate-500 font-bold">Cancel</button>
                <button onClick={handleAddWalkIn} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStaffModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Create Staff Account</h2>
            <p className="text-slate-500 text-sm font-medium mb-6">Staff will use this ID to log in.</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Full Name</label>
                <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="e.g. Nurse Joy" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Role</label>
                <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700" value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Password</label>
                <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" type="text" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} placeholder="Set a strong password" />
              </div>

              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowStaffModal(false)} className="flex-1 py-4 text-slate-500 font-bold">Cancel</button>
                <button onClick={handleAddStaff} disabled={staffCreating} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black disabled:opacity-50">
                  {staffCreating ? 'Creating...' : 'Create Staff'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && createdStaff && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[110] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>

            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 scale-110 shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-black text-slate-900 text-center mb-2">Staff Created!</h2>
            <p className="text-slate-500 text-sm font-medium text-center mb-8">
              Copy these credentials and share them securely with the staff member.
            </p>

            <div className="space-y-3 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Staff ID / Login Code</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-black text-lg text-teal-700 tracking-wider">{createdStaff.code}</p>
                  <button onClick={() => copyToClipboard(createdStaff.code, 'Staff ID')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-teal-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Temporary Password</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">{createdStaff.password}</p>
                  <button onClick={() => copyToClipboard(createdStaff.password, 'Password')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-teal-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-[10px] font-bold text-amber-900 leading-tight">These credentials will not be shown again. Please ensure you have copied them safely.</p>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-200 active:scale-95 transition-all"
            >
              Done, close this
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
