import React from 'react';
import { Link } from 'react-router-dom';
import { Building, Users, ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';

const HospitalWelcome: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-100">
                            <Stethoscope className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">HealthQueue</span>
                    </Link>
                    <Link to="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                        Partners Portal
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        Secure access for hospital administrators and medical staff.
                        Manage your facility or access your workstation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full mx-auto">
                    {/* Hospital Admin Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-900/10 transition-all border border-slate-100 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                <Building />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Hospital Administration</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed h-12">
                                For hospital owners and administrators to manage facility details, departments, and analytics.
                            </p>

                            <div className="space-y-4">
                                <Link
                                    to="/hospital/login"
                                    className="block w-full py-4 text-center bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 active:scale-[0.98] transition-all"
                                >
                                    Admin Sign In
                                </Link>
                                <Link
                                    to="/admin/signup"
                                    className="block w-full py-4 text-center bg-white border-2 border-slate-100 text-slate-700 font-bold rounded-xl hover:border-teal-600 hover:text-teal-600 transition-all"
                                >
                                    Register as an Admin
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Staff Member Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all border border-slate-100 group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <Users />
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 mb-3">Medical Staff</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed h-12">
                                For doctors, nurses, and receptionists to manage patient queues, appointments, and consultations.
                            </p>

                            <div className="space-y-4">
                                <Link
                                    to="/staff/login"
                                    className="block w-full py-4 text-center bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    Staff Workstation Login <ArrowRight className="w-4 h-4" />
                                </Link>
                                <div className="py-4 text-center text-sm text-slate-400">
                                    <span className="flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Staff ID Required
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-8 text-center text-sm text-slate-400">
                <p>&copy; {new Date().getFullYear()} HealthQueue. Secure Portal.</p>
            </footer>
        </div>
    );
};

export default HospitalWelcome;
