import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQueue } from '../store/QueueContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    Users, Calendar, Clock, CheckCircle, Search,
    MapPin, Phone, User as UserIcon, LogOut,
    Activity, FileText, LayoutDashboard, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
    const { user, signOut } = useAuth();
    const { queue, hospitals, updateStatus } = useQueue();
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

            // 3. Fetch My Assigned Patients (Mock logic for now, real DB query later)
            setMyPatients(queue.filter(q => q.hospitalId === staffData.hospital_id));

        } catch (error) {
            console.error('Error fetching staff details:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (queueId: string, newStatus: 'completed' | 'cancelled' | 'serving') => {
        try {
            await updateStatus(queueId, newStatus);
            toast.success(`Patient status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed top-16 h-[calc(100vh-64px)] z-10">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                            <Users className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Staff Portal</h2>
                            <p className="text-xs text-slate-400">Health Queue</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Menu</div>

                    <a href="#" className="flex items-center gap-3 px-4 py-3 bg-teal-600 rounded-xl text-white font-medium">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </a>

                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                        <Calendar className="w-5 h-5" />
                        Appointments
                    </a>

                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                        <Users className="w-5 h-5" />
                        My Patients
                    </a>

                    <div className="px-4 py-2 mt-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Profile</div>

                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <span className="text-xs font-bold">{profile?.full_name?.charAt(0) || 'S'}</span>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{profile?.full_name}</p>
                            <p className="text-xs text-slate-500 truncate">{profile?.role} • {hospital?.name || 'Loading...'}</p>
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.full_name}</h1>
                        <p className="text-slate-500">
                            Staff ID: <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700">{profile?.staff_code || '---'}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-teal-600">{hospital?.name}</p>
                        <p className="text-xs text-slate-500">{hospital?.location}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Active Patients</p>
                                <h3 className="text-2xl font-bold text-slate-900">{myPatients.filter(p => p.status === 'waiting').length}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Served Today</p>
                                <h3 className="text-2xl font-bold text-slate-900">{myPatients.filter(p => p.status === 'completed').length}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Avg. Wait Time</p>
                                <h3 className="text-2xl font-bold text-slate-900">12m</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient Queue List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900">Current Queue</h3>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search patient..."
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Patient ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Wait Time</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {myPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                            No patients in queue currently
                                        </td>
                                    </tr>
                                ) : (
                                    myPatients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-slate-600">{patient.patientId || '---'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                        {patient.patientName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{patient.patientName}</p>
                                                        <p className="text-xs text-slate-500">{patient.service}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${patient.status === 'serving' ? 'bg-blue-100 text-blue-800' :
                                                        patient.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {patient.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                15 mins
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {patient.status === 'waiting' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(patient.id, 'serving')}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Call Patient"
                                                        >
                                                            <Activity className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {patient.status === 'serving' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(patient.id, 'completed')}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Complete Service"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
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
        </div>
    );
};

export default StaffDashboard;
