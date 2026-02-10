import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQueue } from '../store/QueueContext';
import { QueueStatus, JourneyStage } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    Users, Calendar, Clock, CheckCircle, Search,
    MapPin, Phone, User as UserIcon, LogOut,
    Activity, FileText, LayoutDashboard, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatStatus, formatStage } from '../utils/formatters';

const StaffDashboard = () => {
    const { user, signOut } = useAuth();
    const { queue, hospitals, updateQueueItem } = useQueue();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [hospital, setHospital] = useState<any>(null);
    const [myPatients, setMyPatients] = useState<any[]>([]);

    // State for Hospital Access Card
    const [accessHospitalId, setAccessHospitalId] = useState('');

    useEffect(() => {
        // Pre-fill ID if coming from registration
        if (location.state?.newHospitalId) {
            setAccessHospitalId(location.state.newHospitalId);
            toast.success('Registration successful! Please confirm your Hospital ID to access the dashboard.', {
                duration: 6000,
                icon: '🎉'
            });
        }
        fetchStaffDetails();
    }, [user, location.state]);

    const handleAccessHospital = () => {
        if (!accessHospitalId.trim()) {
            toast.error('Please enter a valid Hospital ID');
            return;
        }
        navigate(`/admin/${accessHospitalId.trim()}/dashboard`);
    };

    const fetchStaffDetails = async () => {
        if (!user) return;

        try {
            // 1. Get Staff Profile
            const { data, error: staffError } = await supabase
                .from('staff')
                .select('*')
                .eq('id', user.id)
                .single();

            const staffData = data as any;

            if (staffError) throw staffError;

            // Explicitly check for null
            if (!staffData) {
                throw new Error('Staff profile not found');
            }

            setProfile(staffData);

            // 2. Get Hospital Details
            if (staffData.hospital_id) {
                const { data: hospData } = await supabase
                    .from('hospitals')
                    .select('*')
                    .eq('id', staffData.hospital_id)
                    .single();
                setHospital(hospData);
            }

            // 3. Fetch Patients
            // - If Receptionist: Fetch PENDING (for confirmation) and WAITING (for overview)
            // - If Medical Staff: Fetch assigned patients only
            const today = new Date().toISOString().split('T')[0];
            const { data: qData } = await supabase
                .from('queue_items')
                .select('*')
                .eq('hospital_id', staffData.hospital_id)
                .eq('appointment_date', today); // Only today's patients

            if (qData) {
                // Map DB items to local shape
                const mappedQueue = (qData as any[]).map((item: any) => ({
                    id: item.id,
                    ticketId: item.ticket_id,
                    patientName: item.patient_name,
                    phone: item.phone,
                    status: item.status,
                    stage: item.stage,
                    hospitalId: item.hospital_id,
                    department: item.department,
                    service: item.service,
                    timeSlot: item.time_slot,
                    date: item.appointment_date,
                    isEmergency: item.is_emergency,
                    timestamp: new Date(item.created_at || Date.now()).getTime(),
                    paymentStatus: item.payment_status,
                    assignedStaffId: item.assigned_staff_id,
                    notified: item.notified
                }));

                setMyPatients(mappedQueue);
            }

        } catch (error) {
            console.error('Error fetching staff details:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (queueId: string, newStatus: QueueStatus) => {
        try {
            // 1. Update Supabase
            // Note: Staff NOT assigning themselves anymore. Admin assigns.
            const updates: any = {
                status: newStatus,
                stage: newStatus === QueueStatus.IN_PROGRESS ? JourneyStage.DOCTOR : JourneyStage.COMPLETED
            };

            const { error } = await (supabase
                .from('queue_items') as any)
                .update(updates)
                .eq('id', queueId);

            if (error) throw error;

            // 2. Update Local State (Optimistic)
            setMyPatients(prev => prev.map(p => p.id === queueId ? { ...p, ...updates } : p));
            updateQueueItem(queueId, updates);

            toast.success(`Patient status updated to ${formatStatus(newStatus)}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-healthcare-bg">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-healthcare-bg flex">
            {/* Sidebar Navigation */}
            <aside className="w-72 bg-healthcare-surface border-r border-main hidden md:flex flex-col fixed top-20 h-[calc(100vh-80px)] z-10">
                <div className="p-8 border-b border-main">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center">
                            <Users className="text-teal-500 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-black text-lg tracking-tight">Staff Portal</h2>
                            <p className="text-[10px] text-healthcare-text-muted font-black uppercase tracking-widest">Healthcare Logic</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                    <div className="px-4 py-4 text-[10px] font-black text-healthcare-text-muted uppercase tracking-widest">Main Menu</div>

                    <a href="#" className="flex items-center gap-4 px-6 py-4 bg-teal-600 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 mx-2">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </a>

                    <a href="#" className="flex items-center gap-4 px-6 py-4 text-healthcare-text-muted hover:text-healthcare-text hover:bg-healthcare-bg rounded-2xl transition-all mx-2 font-bold">
                        <Calendar className="w-5 h-5" />
                        Appointments
                    </a>

                    <a href="#" className="flex items-center gap-4 px-6 py-4 text-healthcare-text-muted hover:text-healthcare-text hover:bg-healthcare-bg rounded-2xl transition-all mx-2 font-bold">
                        <Users className="w-5 h-5" />
                        My Patients
                    </a>

                    <div className="px-6 py-6 mt-4 text-[10px] font-black text-healthcare-text-muted uppercase tracking-widest">System</div>

                    <div className="flex items-center gap-3 px-4 py-4 bg-healthcare-bg/50 rounded-2xl mx-2 border border-main">
                        <div className="w-10 h-10 rounded-xl bg-healthcare-surface border border-main flex items-center justify-center">
                            <span className="text-sm font-black text-teal-500">{profile?.full_name?.charAt(0) || 'S'}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-black truncate">{profile?.full_name}</p>
                            <p className="text-[10px] text-healthcare-text-muted font-black truncate uppercase tracking-tighter">{profile?.role}</p>
                        </div>
                    </div>
                </nav>

                <div className="p-6 border-t border-main">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-4 w-full px-6 py-4 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 p-6 md:p-12 space-y-10">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Welcome, {profile?.full_name}</h1>
                        <p className="text-healthcare-text-muted font-bold">
                            STAFF CREDENTIALS • <span className="font-mono bg-healthcare-surface border border-main px-3 py-1 rounded-lg text-healthcare-text">{profile?.staff_code || '---'}</span>
                        </p>
                    </div>
                    <div className="text-left md:text-right bg-healthcare-surface p-4 rounded-2xl border border-main shadow-sm min-w-[200px]">
                        <p className="text-xs font-black text-teal-500 uppercase tracking-widest mb-1">{hospital?.name}</p>
                        <p className="text-sm font-bold opacity-80">{hospital?.location}</p>
                    </div>
                </header>

                {/* Hospital Access Card - Only visible to Admins or after registration */}
                {(profile?.role === 'admin' || profile?.role === 'hospital_admin' || location.state?.newHospitalId) && (
                    <div className="bg-gradient-to-r from-teal-900 to-slate-900 p-8 rounded-3xl shadow-xl mb-10 text-white relative overflow-hidden animate-in slide-in-from-top-4 duration-700">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                        <LayoutDashboard className="w-5 h-5 text-teal-300" />
                                    </div>
                                    <h2 className="text-2xl font-black">Manage Hospital</h2>
                                </div>
                                <p className="text-teal-200 font-medium max-w-md">
                                    Enter your Hospital ID to access the administration panel, manage queues, and view analytics.
                                </p>
                                {location.state?.newHospitalId && (
                                    <p className="mt-2 text-xs font-bold text-teal-400 bg-teal-900/50 inline-block px-3 py-1 rounded-full border border-teal-700">
                                        ✨ Use the ID generated for your new hospital
                                    </p>
                                )}
                            </div>
                            <div className="flex w-full md:w-auto bg-white/10 p-1.5 rounded-2xl backdrop-blur-sm border border-white/20 focus-within:bg-white/20 focus-within:border-teal-400 transition-all">
                                <input
                                    value={accessHospitalId}
                                    onChange={(e) => setAccessHospitalId(e.target.value)}
                                    placeholder="Paste Hospital ID..."
                                    className="bg-transparent text-white placeholder-teal-200/50 px-4 py-2 outline-none w-full md:w-80 font-mono font-bold tracking-wide"
                                />
                                <button
                                    onClick={handleAccessHospital}
                                    className="bg-white text-teal-900 px-6 py-2 rounded-xl font-black hover:bg-teal-50 transition-colors shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap"
                                >
                                    Open Dashboard <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 p-40 bg-teal-500 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/4"></div>
                        <div className="absolute bottom-0 left-0 p-32 bg-blue-600 rounded-full blur-3xl opacity-10 translate-y-1/2 -translate-x-1/4"></div>
                    </div>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-healthcare-surface p-8 rounded-[2.5rem] border border-main shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 transition-transform group-hover:scale-110">
                                <Users className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] text-healthcare-text-muted font-black uppercase tracking-widest mb-1">Active Patients</p>
                                <h3 className="text-3xl font-black">{myPatients.filter(p => p.status === QueueStatus.WAITING).length}</h3>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                    </div>

                    <div className="bg-healthcare-surface p-8 rounded-[2.5rem] border border-main shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 transition-transform group-hover:scale-110">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] text-healthcare-text-muted font-black uppercase tracking-widest mb-1">Served Today</p>
                                <h3 className="text-3xl font-black">{myPatients.filter(p => p.status === QueueStatus.COMPLETED).length}</h3>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                    </div>

                    <div className="bg-healthcare-surface p-8 rounded-[2.5rem] border border-main shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 transition-transform group-hover:scale-110">
                                <Clock className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] text-healthcare-text-muted font-black uppercase tracking-widest mb-1">Avg. Wait Time</p>
                                <h3 className="text-3xl font-black">12m</h3>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                    </div>
                </div>

                {/* Patient Queue List */}
                <div className="bg-healthcare-surface rounded-[2.5rem] border border-main shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-main flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="text-xl font-black tracking-tight">Current Patient Queue</h3>
                            <p className="text-xs text-healthcare-text-muted font-bold uppercase tracking-widest mt-1">Live Updates</p>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-healthcare-text-muted" />
                            <input
                                type="text"
                                placeholder="Search patient..."
                                className="w-full pl-10 pr-4 py-3 bg-healthcare-bg border border-main rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-healthcare-bg/50 border-b border-main">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-healthcare-text-muted uppercase tracking-widest">Patient ID</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-healthcare-text-muted uppercase tracking-widest">Full Name & Service</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-healthcare-text-muted uppercase tracking-widest">Queue Status</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-healthcare-text-muted uppercase tracking-widest">Wait Time</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-healthcare-text-muted uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-main">
                                {myPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                                                <Activity className="w-12 h-12" />
                                                <p className="font-black text-sm uppercase tracking-widest">No patients in queue currently</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    myPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-healthcare-bg/40 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="font-mono text-xs font-bold bg-healthcare-bg border border-main px-3 py-1.5 rounded-lg text-healthcare-text-muted group-hover:text-healthcare-text transition-colors">
                                                    {patient.ticketId || '---'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center text-sm font-black border border-teal-500/20 shadow-sm shadow-teal-500/10">
                                                        {patient.patientName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-lg tracking-tight group-hover:text-teal-500 transition-colors">{patient.patientName}</p>
                                                        <p className="text-[10px] text-healthcare-text-muted font-black uppercase tracking-widest mt-0.5">{patient.service}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border
                                            ${patient.status === QueueStatus.IN_PROGRESS ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                        patient.status === QueueStatus.COMPLETED ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    }`}>
                                                    {formatStatus(patient.status)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-healthcare-text-muted font-bold text-sm">
                                                    <Clock className="w-4 h-4 text-teal-500/40" />
                                                    {/* Mock wait time logic */}
                                                    {Math.floor((Date.now() - patient.timestamp) / 60000)} mins
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    {/* Receptionist Confirmation Logic */}
                                                    {(profile?.role === 'receptionist' || profile?.role === 'admin') && patient.status === QueueStatus.PENDING && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(patient.id, QueueStatus.WAITING)}
                                                            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-md"
                                                        >
                                                            Confirm
                                                        </button>
                                                    )}

                                                    {/* Assigned Staff Action Logic */}
                                                    {patient.assignedStaffId === user?.id && (
                                                        <>
                                                            {patient.status === QueueStatus.WAITING && (
                                                                <button
                                                                    onClick={() => handleStatusUpdate(patient.id, QueueStatus.IN_PROGRESS)}
                                                                    className="w-10 h-10 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                                                    title="Start Session"
                                                                >
                                                                    <Activity className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            {patient.status === QueueStatus.IN_PROGRESS && (
                                                                <button
                                                                    onClick={() => handleStatusUpdate(patient.id, QueueStatus.COMPLETED)}
                                                                    className="w-10 h-10 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl flex items-center justify-center hover:bg-green-500 hover:text-white transition-all shadow-sm"
                                                                    title="Complete Service"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}

                                                    <button className="w-10 h-10 bg-healthcare-bg text-healthcare-text-muted border border-main rounded-xl flex items-center justify-center hover:bg-healthcare-surface hover:text-healthcare-text transition-all">
                                                        <FileText className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div >
    );
};

export default StaffDashboard;
