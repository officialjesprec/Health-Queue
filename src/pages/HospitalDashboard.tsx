import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Calendar, FileText, PieChart,
    Settings, Search, Plus, Bell,
    TrendingUp, Clock, CreditCard, Activity,
    ChevronRight, MoreVertical, Filter
} from 'lucide-react';
import { useIsAdmin } from '../hooks/useAuth';
import { useQueue } from '../store/QueueContext';

const HospitalDashboard: React.FC = () => {
    const { adminData } = useIsAdmin();
    const { patients, staffMembers } = useQueue();
    const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'appointments' | 'billing' | 'reports'>('overview');

    const stats = [
        { label: 'Total Patients', value: patients.length, change: '+12%', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Today\'s Visits', value: '42', change: '+5%', icon: Activity, color: 'text-teal-500', bg: 'bg-teal-500/10' },
        { label: 'Avg. Consultation', value: '18m', change: '-2%', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Revenue', value: '$12.4k', change: '+18%', icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    ];

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link to="/admin/dashboard" className="text-xs font-bold text-slate-500 hover:text-teal-500 flex items-center gap-1 transition-colors">
                            <ChevronRight className="w-3 h-3 rotate-180" />
                            Back to Admin Dashboard
                        </Link>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">Hospital Management System</h1>
                    <p className="text-slate-400 font-medium">Monitoring and managing your facility's core operations.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 w-64 transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full border-2 border-slate-800"></span>
                    </button>
                    <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-teal-900/20 transition-all active:scale-95">
                        <Plus className="w-4 h-4" />
                        New Admission
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-6 flex flex-col justify-between group cursor-pointer hover:border-teal-500/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-xs font-black px-2 py-1 rounded-lg ${stat.change.startsWith('+') ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-black group-hover:text-teal-400 transition-colors">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-800/50 rounded-2xl w-fit border border-slate-700">
                {(['overview', 'patients', 'appointments', 'billing', 'reports'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl text-sm font-black transition-all capitalize ${activeTab === tab
                            ? 'bg-teal-600 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Active Patients Table */}
                    <div className="card !p-0 overflow-hidden">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <h2 className="text-xl font-black">Recent Admissions</h2>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                    <Filter className="w-4 h-4" />
                                </button>
                                <button className="text-xs font-black text-teal-400 hover:text-teal-300">View All</button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Patient</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Doctor</th>
                                        <th className="px-6 py-4">Priority</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {[1, 2, 3, 4, 5].map((_, i) => (
                                        <tr key={i} className="group hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                                                        JD
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">John Doe</p>
                                                        <p className="text-[10px] text-slate-500">OPD-10293</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black px-2 py-1 rounded-md bg-teal-500/10 text-teal-500 uppercase tracking-tighter">
                                                    Waitlist
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-300">Dr. Sarah Johnson</td>
                                            <td className="px-6 py-4">
                                                <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                    <div className="w-2/3 h-full bg-orange-500"></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                                                    <MoreVertical className="w-4 h-4 text-slate-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-8">
                    {/* Scheduling Widget */}
                    <div className="card bg-gradient-to-br from-indigo-900/40 to-slate-900 border-indigo-500/20">
                        <h2 className="text-lg font-black mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-400" />
                            Next Shift
                        </h2>
                        <div className="space-y-4">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
                                        <span className="text-[10px] font-black uppercase opacity-60">Feb</span>
                                        <span className="text-lg font-black leading-tight">10</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold">General Ward Round</h4>
                                        <p className="text-xs text-slate-400">08:00 AM - 12:00 PM</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="flex -space-x-2">
                                                {[1, 2].map((_, j) => (
                                                    <div key={j} className="w-5 h-5 rounded-full border-2 border-slate-900 bg-slate-700" />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-bold">+3 others</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest rounded-xl transition-all">
                                Full Schedule
                            </button>
                        </div>
                    </div>

                    {/* Activity Logs */}
                    <div className="card">
                        <h2 className="text-lg font-black mb-6">Recent Activity</h2>
                        <div className="space-y-6">
                            {[
                                { time: '12m ago', msg: 'Emergency admit in Room 402', color: 'bg-red-500' },
                                { time: '45m ago', msg: 'Pharmacy inventory updated', color: 'bg-teal-500' },
                                { time: '1h ago', msg: 'New lab results ready for JD', color: 'bg-blue-500' },
                            ].map((log, i) => (
                                <div key={i} className="relative pl-6 pb-1">
                                    {i !== 2 && <div className="absolute left-[3px] top-2 bottom-0 w-px bg-slate-700"></div>}
                                    <div className={`absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full ${log.color}`}></div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{log.time}</p>
                                    <p className="text-sm font-medium text-slate-300 leading-tight">{log.msg}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {activeTab === 'reports' && (
                <div className="card">
                    <h2 className="text-xl font-black mb-6">Detailed Patient Activity Report</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Patient Name</th>
                                    <th className="px-6 py-4">Service</th>
                                    <th className="px-6 py-4">Assigned Staff</th>
                                    <th className="px-6 py-4">Time In</th>
                                    <th className="px-6 py-4">Time Out</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700 text-sm">
                                {patients.map((patient, i) => (
                                    <tr key={i} className="group hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-bold">{patient.patientName || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-slate-300">{patient.service}</td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {staffMembers.find((s: any) => s.id === patient.assignedStaffId)?.full_name || '---'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{patient.timeSlot}</td>
                                        <td className="px-6 py-4 text-slate-400">---</td>
                                        <td className="px-6 py-4 text-slate-400">---</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${patient.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                patient.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                {patient.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {patients.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No records found for this period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HospitalDashboard;
