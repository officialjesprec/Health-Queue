import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';
import { useAuth, useIsAdmin } from '../hooks/useAuth';
import { QueueStatus, JourneyStage, QueueItem, Hospital } from '../types';
import { HOSPITALS } from '../constants';
import { supabase } from '../lib/supabase';
import InfoTooltip from '../components/InfoTooltip';

import { createClient } from '@supabase/supabase-js';
import { Building, Users, Lock, Loader2, Clipboard, ArrowRight, UserPlus, LogOut, Check, HelpCircle, ChevronRight, Activity, CreditCard, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated } = useAuth(); // Auth Hook
  const { isAdmin, adminData, loading: adminLoading } = useIsAdmin();
  const { queue, updateQueueItem, advanceQueue, addQueueItem, acceptBooking, hospitals } = useQueue();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'patients' | 'staff' | 'profile'>('queue');
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

  // Patient List State
  const [patients, setPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [staffLoading, setStaffLoadingState] = useState(false);

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
      const prefix = hospital.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const staffCode = `${prefix}-${randomNum}`;
      const dummyEmail = `staff_${staffCode.toLowerCase()}_${Date.now()}@healthqueue.local`;

      const tempClient = createClient(
        (import.meta as any).env.VITE_SUPABASE_URL,
        (import.meta as any).env.VITE_SUPABASE_ANON_KEY
      );

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
      if (!hospitalId && !adminData?.hospital_id) {
        setHospitalLoading(false);
        return;
      }

      const activeHospitalId = hospitalId || adminData?.hospital_id;

      try {
        const { data: staffCheck, error: staffError } = await supabase
          .from('staff')
          .select('*')
          .eq('id', user?.id)
          .eq('hospital_id', activeHospitalId)
          .maybeSingle();

        if (staffError || !staffCheck || (staffCheck as any).role !== 'admin') {
          if (!isAdmin) {
            toast.error('Unauthorized access to this hospital dashboard');
            navigate('/dashboard');
            return;
          }
        }
      } catch (err) {
        navigate('/dashboard');
        return;
      }

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

      const localHospital = hospitals.find(h => h.id === activeHospitalId) || HOSPITALS.find(h => h.id === activeHospitalId);
      if (localHospital) {
        setHospital(localHospital);
        setHospitalLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', activeHospitalId)
          .single();

        if (error) throw error;

        if (data) {
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

    if (isAuthenticated) fetchHospital();
  }, [hospitalId, adminData, hospitals, location.state, isAdmin, isAuthenticated]);

  // Fetch Patients
  useEffect(() => {
    const fetchPatients = async () => {
      if (!hospital) return;
      setPatientsLoading(true);
      try {
        const { data, error } = await supabase
          .from('hospital_profiles')
          .select(`
            id,
            card_id,
            registration_date,
            users (
              id,
              full_name,
              email,
              phone,
              gender,
              date_of_birth
            )
          `)
          .eq('hospital_id', hospital.id);

        if (error) throw error;
        setPatients(data || []);
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setPatientsLoading(false);
      }
    };

    if (activeTab === 'patients') {
      fetchPatients();
    }
  }, [hospital, activeTab]);

  // Fetch Staff
  useEffect(() => {
    const fetchStaff = async () => {
      if (!hospital) return;
      setStaffLoadingState(true);
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .eq('hospital_id', hospital.id);

        if (error) throw error;
        setStaffMembers(data || []);
      } catch (err) {
        console.error('Error fetching staff:', err);
      } finally {
        setStaffLoadingState(false);
      }
    };

    if (activeTab === 'staff') {
      fetchStaff();
    }
  }, [hospital, activeTab]);

  // Protect Route
  useEffect(() => {
    if (!isAuthenticated && !adminLoading) {
      const loginPath = hospitalId ? `/admin/${hospitalId}/login` : '/hospital/login';
      navigate(loginPath);
    }
  }, [isAuthenticated, navigate, hospitalId, adminLoading]);

  if (hospitalLoading || adminLoading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-slate-600">Loading hospital information...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="p-12 text-center min-h-[60vh] flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-teal-600"></div>

          <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Building className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Hospital Registered</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            You are logged in as an Administrator, but you haven't registered your facility yet.
            Register now to start managing your queue and patients.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/register-hospital')}
              className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-100 hover:bg-teal-700 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
            >
              Register New Hospital
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Registration takes less than 2 minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const filteredQueue = queue.filter(q => q.hospitalId === hospital.id && q.department === selectedDept && q.date === viewDate && q.status !== QueueStatus.PENDING);
  const pendingBookings = queue.filter(q => q.hospitalId === hospital.id && q.status === QueueStatus.PENDING);
  const isToday = viewDate === new Date().toISOString().split('T')[0];

  const stats = {
    waiting: filteredQueue.filter(q => q.status === QueueStatus.WAITING).length,
    active: filteredQueue.filter(q => q.status === QueueStatus.IN_PROGRESS).length,
    upcoming: queue.filter(q => q.hospitalId === hospital.id && q.status === QueueStatus.UPCOMING).length,
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

    // Auto-accept isn't easily done here without the ID of the newly added item
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
            <Calendar className="w-4 h-4 text-slate-400" />
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
            <UserPlus className="w-5 h-5" />
            <span className="text-sm">New Entry</span>
          </button>
          {isToday && (
            <button
              onClick={() => advanceQueue(hospital.id, selectedDept)}
              className="px-4 py-2.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 flex items-center space-x-2 transition-all shadow-lg shadow-teal-100 active:scale-95"
            >
              <Activity className="w-5 h-5" />
              <span className="text-sm">Call Next</span>
            </button>
          )}
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-4 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 flex items-center space-x-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">Add Staff</span>
          </button>
          <button
            onClick={() => {
              signOut();
              navigate(`/hospital/login`);
            }}
            className="px-4 py-2.5 bg-red-50 text-red-600 font-black rounded-xl hover:bg-red-100 flex items-center space-x-2 transition-all border border-red-100"
          >
            <LogOut className="w-4 h-4" />
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

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'queue' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Active Queue
          {activeTab === 'queue' && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'patients' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Registered Patients
          {activeTab === 'patients' && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'staff' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Staff Management
          {activeTab === 'staff' && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'profile' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Hospital Profile
          {activeTab === 'profile' && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full"></div>}
        </button>
      </div>

      {activeTab === 'queue' && (
        <div className="space-y-8">
          {/* Pending Approvals Section */}
          {pendingBookings.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">New Booking Requests</h2>
              <div className="grid gap-4">
                {pendingBookings.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black text-lg">?</div>
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
                      <td className="px-6 py-6 font-black text-teal-700">{item.service}</td>
                      <td className="px-6 py-6">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                          Card {item.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-xs font-bold text-slate-700">{item.stage}</td>
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
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900">Hospital Patient Records</h3>
              <p className="text-slate-500 font-medium text-sm">View and manage patients registered at {hospital.name}.</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-teal-600">{patients.length}</span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Registered</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5">Card ID</th>
                  <th className="px-6 py-5">Patient Name</th>
                  <th className="px-6 py-5">Gender / Age</th>
                  <th className="px-6 py-5">Phone</th>
                  <th className="px-8 py-5 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold italic">Fetching medical records...</p>
                    </td>
                  </tr>
                ) : patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-bold italic">No patients registered yet.</p>
                    </td>
                  </tr>
                ) : (
                  patients.map(p => {
                    const patient = p.users || {};
                    const birthYear = patient.date_of_birth ? new Date(patient.date_of_birth).getFullYear() : null;
                    const age = birthYear ? new Date().getFullYear() - birthYear : 'N/A';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedPatient(p)}>
                        <td className="px-8 py-6 font-mono font-bold text-teal-700 tracking-wider">{p.card_id}</td>
                        <td className="px-6 py-6">
                          <p className="font-bold text-slate-900">{patient.full_name || 'N/A'}</p>
                          <p className="text-xs text-slate-400">{patient.email}</p>
                        </td>
                        <td className="px-6 py-6">
                          <span className="text-sm font-bold text-slate-600 capitalize">{patient.gender || 'N/A'}</span>
                          <span className="mx-2 text-slate-300">|</span>
                          <span className="text-xs font-black text-slate-400">{age} YRS</span>
                        </td>
                        <td className="px-6 py-6 font-medium text-slate-600">{patient.phone || 'N/A'}</td>
                        <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">
                          {new Date(p.registration_date).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900">Hospital Staff Directory</h3>
              <p className="text-slate-500 font-medium text-sm">Manage access and roles for your facility staff.</p>
            </div>
            <button
              onClick={() => setShowStaffModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add New Staff
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5">Staff Member</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Staff Code</th>
                    <th className="px-6 py-5">Email</th>
                    <th className="px-8 py-5 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold italic">Loading staff members...</p>
                      </td>
                    </tr>
                  ) : staffMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <p className="text-slate-400 font-bold italic">No staff members registered yet.</p>
                      </td>
                    </tr>
                  ) : (
                    staffMembers.map(staff => (
                      <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm uppercase">
                              {staff.full_name?.charAt(0)}
                            </div>
                            <span className="font-bold text-slate-900">{staff.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-medium text-slate-600 capitalize">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${staff.role === 'doctor' ? 'bg-blue-50 text-blue-600' :
                              staff.role === 'nurse' ? 'bg-teal-50 text-teal-600' :
                                'bg-slate-50 text-slate-600'
                            }`}>
                            {staff.role}
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <code className="text-xs font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{staff.staff_code}</code>
                        </td>
                        <td className="px-6 py-6 text-sm text-slate-500">{staff.email}</td>
                        <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">
                          {new Date(staff.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">Facility Information</h3>
              <div className="grid gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Hospital Name</label>
                  <p className="text-2xl font-black text-slate-900">{hospital.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Legal Location</label>
                  <p className="text-lg font-bold text-slate-700">{hospital.location}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-2 block">Medical Card Fee</label>
                  <p className="text-lg font-black text-teal-600">₦ {hospital.registrationFee.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">Configured Departments</h3>
              <div className="flex flex-wrap gap-3">
                {hospital.departments.map(dept => (
                  <span key={dept} className="px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-700">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-teal-900 rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 opacity-50" />
                  Portal ID
                </h3>
                <p className="font-mono text-teal-200 text-xs break-all mb-6">{hospital.id}</p>
                <button
                  onClick={() => copyToClipboard(hospital.id, 'Hospital ID')}
                  className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-black text-sm transition-all"
                >
                  Copy ID
                </button>
              </div>
            </div>

            <div className="bg-amber-50 rounded-[2.5rem] p-10 border border-amber-100 shadow-sm">
              <h3 className="text-lg font-black text-amber-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 opacity-50" />
                Patient Access
              </h3>
              <p className="text-sm text-amber-800 font-medium leading-relaxed mb-6">
                Patients can find your hospital in the directory and book appointments using their digital medical card.
              </p>
              <button
                onClick={() => navigate(`/hospital/${hospital.id}/book`)}
                className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-200"
              >
                View Booking Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Detail Slider */}
      {selectedPatient && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedPatient(null)}></div>
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">Patient File</h2>
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <ChevronRight className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-10 space-y-12">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-3xl font-black text-slate-300">
                  {selectedPatient.users?.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">{selectedPatient.users?.full_name}</h3>
                  <p className="text-teal-600 font-black tracking-widest text-xs uppercase mt-1">CARD ID: {selectedPatient.card_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</p>
                  <p className="font-bold text-slate-700">{selectedPatient.users?.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone Number</p>
                  <p className="font-bold text-slate-700">{selectedPatient.users?.phone || 'Not Provided'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Gender</p>
                  <p className="font-bold text-slate-700 capitalize">{selectedPatient.users?.gender || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date of Birth</p>
                  <p className="font-bold text-slate-700">{selectedPatient.users?.date_of_birth ? new Date(selectedPatient.users.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 font-heading">Financial Overview</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-7 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="text-2xl font-black text-slate-900">0</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Completed Sessions</p>
                  </div>
                  <div className="p-7 bg-teal-50 rounded-[2rem] border border-teal-100">
                    <p className="text-2xl font-black text-teal-800">₦ 0</p>
                    <p className="text-[10px] font-black uppercase text-teal-600 tracking-widest">Revenue Generated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWalkInModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Add Walk-in</h2>
            <div className="space-y-4">
              <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Patient Name" value={walkInName} onChange={e => setWalkInName(e.target.value)} />
              <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Service" value={walkInService} onChange={e => setWalkInService(e.target.value)} />
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
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>

            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 scale-110 shadow-inner">
              <Check className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2">Staff Created!</h2>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Copy these credentials and share them securely with the staff member.
            </p>

            <div className="space-y-3 mb-8 text-left">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group relative">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Staff ID / Login Code</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-black text-lg text-teal-700 tracking-wider">{createdStaff.code}</p>
                  <button onClick={() => copyToClipboard(createdStaff.code, 'Staff ID')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-teal-600">
                    <Clipboard className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Temporary Password</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">{createdStaff.password}</p>
                  <button onClick={() => copyToClipboard(createdStaff.password, 'Password')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-teal-600">
                    <Clipboard className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3 text-left">
                <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
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
