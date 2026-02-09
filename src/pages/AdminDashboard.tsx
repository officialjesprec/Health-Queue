import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';
import { useAuth, useIsAdmin } from '../hooks/useAuth';
import { QueueStatus, JourneyStage, QueueItem, Hospital } from '../types';
import { HOSPITALS } from '../constants';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { Building, Users, Lock, Loader2, Clipboard, ArrowRight, UserPlus, LogOut, Check, HelpCircle, ChevronRight, Activity, CreditCard, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, adminData, loading: adminProfileLoading } = useIsAdmin();
  const { queue, updateQueueItem, advanceQueue, addQueueItem, acceptBooking, hospitals } = useQueue();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'patients' | 'staff' | 'profile'>('overview');
  const [selectedDept, setSelectedDept] = useState('OPD');
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInService, setWalkInService] = useState('');
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdStaff, setCreatedStaff] = useState<any>(null);
  const [staffCreating, setStaffCreating] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'nurse', password: '' });

  const [patients, setPatients] = useState<any[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [staffLoading, setStaffLoadingState] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, { icon: '📋' });
  };

  const handleAddStaff = async () => {
    if (!newStaff.name || !newStaff.password || !hospital) {
      toast.error('Please fill all fields');
      return;
    }

    setStaffCreating(true);
    try {
      // Refined Prefix: 3 letters of hospital + 5 digits
      const prefix = hospital.name.slice(0, 3).toUpperCase().padEnd(3, 'X');
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

        // Fetch staff list immediately to update the UI
        const { data: updatedStaff } = await supabase
          .from('staff')
          .select('*')
          .eq('hospital_id', hospital.id);

        if (updatedStaff) setStaffMembers(updatedStaff);

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

  const handleRemoveStaff = async (staffId: string) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      setStaffMembers(prev => prev.filter(s => s.id !== staffId));
      toast.success('Staff member removed successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove staff');
    }
  };

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
  }, [hospitalId, adminData, hospitals, isAdmin, isAuthenticated, user, navigate]);

  // Handle switching to overview when hospital is loaded for the first time
  useEffect(() => {
    if (hospital && activeTab === 'queue' && !location.hash) { // Only if coming from nowhere specific
      // setActiveTab('overview'); // Already defaulted to overview
    }
  }, [hospital]);

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

  if (hospitalLoading || adminProfileLoading || authLoading) {
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
          <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Building className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">No Hospital Registered</h2>
          <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            You are logged in as an Administrator, but you haven't registered your facility yet.
          </p>
          <button
            onClick={() => navigate('/register-hospital')}
            className="w-full py-5 bg-teal-600 text-white font-black rounded-2xl shadow-xl shadow-teal-100 uppercase tracking-widest text-sm"
          >
            Register New Hospital
          </button>
        </div>
      </div>
    );
  }

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

  const handleAssignStaff = async (queueId: string, staffId: string) => {
    try {
      const { error } = await supabase
        .from('queue_items')
        .update({ assigned_staff_id: staffId || null })
        .eq('id', queueId);

      if (error) throw error;

      updateQueueItem(queueId, { assignedStaffId: staffId });
      toast.success('Staff assigned successfully');
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error('Failed to assign staff');
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
    setWalkInName('');
    setWalkInService('');
    setShowWalkInModal(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 leading-tight">
            Welcome, <span className="text-teal-600">Dr. {adminData?.full_name || 'Admin'}</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Here's what's happening at your facility today.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border-2 border-slate-100 rounded-xl px-4 py-2 flex items-center space-x-3 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input type="date" className="bg-transparent border-none outline-none text-sm font-bold text-slate-700" value={viewDate} onChange={(e) => setViewDate(e.target.value)} />
          </div>
          <button onClick={() => setShowWalkInModal(true)} className="px-4 py-2.5 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 flex items-center space-x-2 transition-all">
            <UserPlus className="w-5 h-5" />
            <span className="text-sm">New Entry</span>
          </button>
          {isToday && (
            <button onClick={() => advanceQueue(hospital.id, selectedDept)} className="px-4 py-2.5 bg-teal-600 text-white font-black rounded-xl hover:bg-teal-700 flex items-center space-x-2 transition-all">
              <Activity className="w-5 h-5" />
              <span className="text-sm">Call Next</span>
            </button>
          )}
          <button onClick={() => setShowStaffModal(true)} className="px-4 py-2.5 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 flex items-center space-x-2 transition-all">
            <Users className="w-5 h-5" />
            <span className="text-sm">Add Staff</span>
          </button>
          <button onClick={() => { signOut(); navigate('/hospital/login'); }} className="px-4 py-2.5 bg-red-50 text-red-600 font-black rounded-xl hover:bg-red-100 flex items-center space-x-2 transition-all">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Log Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Queue Waiting', value: stats.waiting, bg: 'bg-white', color: 'text-slate-900' },
          { label: 'In Session', value: stats.active, bg: 'bg-teal-50', color: 'text-teal-900' },
          { label: 'Pending Approval', value: pendingBookings.length, bg: 'bg-amber-50', color: 'text-amber-900' },
          { label: 'Upcoming', value: stats.upcoming, bg: 'bg-indigo-50', color: 'text-indigo-900' }
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-[2rem] border border-slate-200 shadow-sm`}>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex space-x-8 border-b border-slate-200 mb-8 overflow-x-auto scrollbar-hide">
        {['overview', 'queue', 'patients', 'staff', 'profile'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'queue' ? 'Active Queue' : tab === 'patients' ? 'Patients' : tab === 'staff' ? 'Staff' : 'Profile'}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-600 rounded-full"></div>}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Manage Hospital Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                  <Building className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Manage Hospital</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                  Comprehensive Hospital Management System: Records, Staffing, and more.
                </p>
                <Link
                  to="/admin/hospital-dashboard"
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Open HMS Portal
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Staff Management Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Staff Management</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                  Add new healthcare providers and manage your existing medical team.
                </p>
                <button
                  onClick={() => setActiveTab('staff')}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                >
                  Manage Team
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Analytics & Reviews Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Activity className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Facility Analytics</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
                  Track patient satisfaction, reviews, and overall facility performance.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-2xl font-black text-slate-900">{patients.length}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Patients</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl">
                    <p className="text-2xl font-black text-amber-600">4.8</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Queue Items</p>
              <p className="text-4xl font-black text-slate-900">{queue.filter(q => q.hospitalId === hospital.id).length}</p>
            </div>
            <div className="bg-teal-50 p-6 rounded-[2rem] border border-teal-100 shadow-sm">
              <p className="text-teal-600 text-[10px] font-black uppercase tracking-widest mb-1">Feedback Received</p>
              <p className="text-4xl font-black text-teal-900">12</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 shadow-sm">
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-1">Active Staff</p>
              <p className="text-4xl font-black text-indigo-900">{staffMembers.length}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">System Health</p>
              <p className="text-4xl font-black text-white">99%</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="space-y-8">
          {pendingBookings.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">New Booking Requests</h2>
              <div className="grid gap-4">
                {pendingBookings.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-black text-lg">?</div>
                      <div>
                        <h3 className="font-bold text-slate-900">{item.patientName}</h3>
                        <p className="text-xs font-bold text-teal-600 uppercase tracking-tight">{item.service} — {item.date}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => updateQueueItem(item.id, { status: QueueStatus.COMPLETED })} className="px-4 py-2 text-red-600 text-[10px] font-black uppercase bg-red-50 rounded-xl">Decline</button>
                      <button onClick={() => acceptBooking(item.id)} className="px-6 py-2 bg-teal-600 text-white text-[10px] font-black uppercase rounded-xl">Accept</button>
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
                  className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all border-2 ${selectedDept === dept ? 'bg-white border-teal-500 text-teal-600 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                >
                  {dept}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5">Patient Details</th>
                    <th className="px-6 py-5">Service</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Assigned Staff</th>
                    <th className="px-6 py-5">Journey</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.length === 0 ? (
                    <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">No active patients.</td></tr>
                  ) : (
                    filteredQueue.map(item => (
                      <tr key={item.id} className={`${item.isEmergency ? 'bg-red-50/40' : ''} hover:bg-slate-50/50 transition-colors`}>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 text-base">{item.ticketId}</span>
                            <span className="text-sm font-bold text-slate-500 mt-1">{item.patientName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 font-black text-teal-700">{item.service}</td>
                        <td className="px-6 py-6 font-black uppercase text-[10px] tracking-widest text-emerald-700">{item.paymentStatus}</td>
                        <td className="px-6 py-6">
                          <select
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
                            value={item.assignedStaffId || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleAssignStaff(item.id, e.target.value)}
                          >
                            <option value="">Select Staff</option>
                            {staffMembers.map((staff) => (
                              <option key={staff.id} value={staff.id}>
                                {staff.full_name} ({staff.role})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-6 text-xs font-bold text-slate-700">{item.stage}</td>
                        <td className="px-8 py-6 text-right">
                          {isToday && item.status !== QueueStatus.COMPLETED && (
                            <button onClick={() => handleUpdateStage(item)} className="px-4 py-2 border-2 border-slate-100 text-slate-900 font-black text-[10px] uppercase rounded-xl">Progress</button>
                          )}
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

      {activeTab === 'patients' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">Hospital Patient Records</h3>
            <span className="text-3xl font-black text-teal-600">{patients.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5">Card ID</th>
                  <th className="px-6 py-5">Patient Name</th>
                  <th className="px-6 py-5">Phone</th>
                  <th className="px-8 py-5 text-right">Registration Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {patientsLoading ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-500">Loading records...</td></tr>
                ) : patients.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400">No patients registered.</td></tr>
                ) : (
                  patients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-mono font-bold text-teal-700">{p.card_id}</td>
                      <td className="px-6 py-6 font-bold text-slate-900">{p.users?.full_name}</td>
                      <td className="px-6 py-6 font-medium text-slate-600">{p.users?.phone}</td>
                      <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">{new Date(p.registration_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">Staff Directory</h3>
            <button onClick={() => setShowStaffModal(true)} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">Add New Staff</button>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[9px] uppercase font-black tracking-widest border-b border-slate-200">
                <tr><th className="px-8 py-5">Staff</th><th className="px-6 py-5">Role</th><th className="px-6 py-5">Code</th><th className="px-6 py-5 text-center">Actions</th><th className="px-8 py-5 text-right">Joined</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffLoading ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-500">Loading staff...</td></tr>
                ) : staffMembers.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400">No staff yet.</td></tr>
                ) : (
                  staffMembers.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{s.full_name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{s.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 uppercase text-[10px] font-black text-indigo-600">{s.role}</td>
                      <td className="px-6 py-6 font-mono font-bold text-slate-400">{s.staff_code}</td>
                      <td className="px-6 py-6 text-center">
                        <button
                          onClick={() => handleRemoveStaff(s.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remove Staff"
                        >
                          <LogOut className="w-4 h-4 rotate-180" />
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right text-xs font-bold text-slate-400">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm max-w-2xl">
          <h3 className="text-xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-100">Facility Information</h3>
          <div className="space-y-6">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Hospital Name</label><p className="text-2xl font-black text-slate-900">{hospital.name}</p></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Location</label><p className="text-lg font-bold text-slate-700">{hospital.location}</p></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Registration Fee</label><p className="text-lg font-black text-teal-600">₦ {hospital.registrationFee.toLocaleString()}</p></div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Create Staff Account</h2>
            <div className="space-y-4">
              <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="Full Name" />
              <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={newStaff.role} onChange={e => setNewStaff({ ...newStaff, role: e.target.value })}>
                <option value="doctor">Doctor</option><option value="nurse">Nurse</option><option value="receptionist">Receptionist</option><option value="pharmacist">Pharmacist</option>
              </select>
              <input className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" value={newStaff.password} onChange={e => setNewStaff({ ...newStaff, password: e.target.value })} placeholder="Password" />
              <div className="flex space-x-3 pt-4">
                <button onClick={() => setShowStaffModal(false)} className="flex-1 py-4 text-slate-500 font-bold">Cancel</button>
                <button onClick={handleAddStaff} disabled={staffCreating} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black disabled:opacity-50">{staffCreating ? 'Creating...' : 'Create Staff'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && createdStaff && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-[2.5rem] p-12 max-w-md w-full shadow-2xl text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-6 font-heading">Staff Created!</h2>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-left">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Staff Access Code</p>
              <p className="font-mono font-black text-xl text-teal-700 tracking-wider">{createdStaff.code}</p>
            </div>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
