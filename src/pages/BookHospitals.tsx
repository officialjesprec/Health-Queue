import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useHospitals } from '../hooks/useHospitals';
import { useAuth } from '../hooks/useAuth';
import { MapPin, ArrowRight, Star, Search, Filter, Clock, Phone } from 'lucide-react';

const BookHospitals: React.FC = () => {
    const { hospitals, loading } = useHospitals();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

    // Get unique departments from all hospitals
    const allDepartments = ['All', ...new Set(hospitals.flatMap(h => h.departments || []))];

    // Filter hospitals based on search and department
    const filteredHospitals = hospitals.filter(hospital => {
        const matchesSearch = hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hospital.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDepartment = selectedDepartment === 'All' ||
            (hospital.departments || []).includes(selectedDepartment);
        return matchesSearch && matchesDepartment;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-healthcare-bg">
                <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-medium text-slate-600">Finding hospitals near you...</p>
                </div>
            </div>
        );
    }

    const handleBookNow = (hospitalId: string) => {
        if (!isAuthenticated) {
            navigate(`/auth/login?redirect=/book/${hospitalId}`);
            return;
        }
        navigate(`/book/${hospitalId}`);
    };

    return (
        <div className="min-h-screen bg-healthcare-bg">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
                <div className="container-custom">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                            Find Your Hospital
                        </h1>
                        <p className="text-xl text-primary-100 mb-8">
                            Choose from our network of verified healthcare facilities and book your appointment instantly.
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white rounded-2xl p-2 flex items-center gap-3 shadow-xl">
                            <Search className="w-6 h-6 text-slate-400 ml-3" />
                            <input
                                type="text"
                                placeholder="Search by hospital name or location..."
                                className="flex-1 bg-transparent border-none outline-none text-slate-900 font-medium py-3 px-2"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters and Results */}
            <section className="py-12">
                <div className="container-custom">
                    {/* Department Filter */}
                    <div className="mb-8 flex items-center gap-4 overflow-x-auto pb-4">
                        <div className="flex items-center gap-2 text-slate-600 font-bold whitespace-nowrap">
                            <Filter className="w-5 h-5" />
                            <span>Filter by Department:</span>
                        </div>
                        <div className="flex gap-2">
                            {allDepartments.map(dept => (
                                <button
                                    key={dept}
                                    onClick={() => setSelectedDepartment(dept)}
                                    className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${selectedDepartment === dept
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                        }`}
                                >
                                    {dept}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mb-6">
                        <p className="text-slate-600 font-medium">
                            Showing <span className="font-bold text-slate-900">{filteredHospitals.length}</span> {filteredHospitals.length === 1 ? 'hospital' : 'hospitals'}
                            {searchQuery && ` matching "${searchQuery}"`}
                        </p>
                    </div>

                    {/* Hospital Grid */}
                    {filteredHospitals.length === 0 ? (
                        <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MapPin className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">No hospitals found</h3>
                            <p className="text-slate-500 mb-6">
                                {searchQuery
                                    ? `We couldn't find any hospitals matching "${searchQuery}". Try adjusting your search.`
                                    : "We couldn't find any hospitals at the moment."}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedDepartment('All');
                                }}
                                className="btn btn-primary"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredHospitals.map((hospital) => (
                                <div
                                    key={hospital.id}
                                    className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary-200"
                                >
                                    {/* Hospital Image Placeholder */}
                                    <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${hospital.is_open ? 'bg-success-500 text-white' : 'bg-red-500 text-white'
                                                }`}>
                                                {hospital.is_open ? 'Open Now' : 'Closed'}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-bold text-slate-900">4.5</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hospital Details */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                                            {hospital.name}
                                        </h3>

                                        <div className="flex items-start gap-2 text-slate-500 text-sm mb-4 min-h-[40px]">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{hospital.location}</span>
                                        </div>

                                        {/* Departments */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {Array.isArray(hospital.departments) && hospital.departments.slice(0, 3).map((dept, i) => (
                                                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                                                    {dept}
                                                </span>
                                            ))}
                                            {Array.isArray(hospital.departments) && hospital.departments.length > 3 && (
                                                <span className="px-2 py-1 bg-slate-50 text-slate-400 text-xs font-medium rounded-lg">
                                                    +{hospital.departments.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick Info */}
                                        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-6 pb-4 border-b border-slate-100">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>24/7 Available</span>
                                            </div>
                                            {hospital.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    <span>Support</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleBookNow(hospital.id)}
                                            className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary-200"
                                        >
                                            <span>Book Appointment</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            {!isAuthenticated && filteredHospitals.length > 0 && (
                <section className="py-16 bg-slate-50">
                    <div className="container-custom text-center">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">
                            Ready to skip the wait?
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                            Create a free account to book appointments, track your queue position, and manage your medical records.
                        </p>
                        <Link to="/auth/signup" className="btn btn-primary btn-lg">
                            Create Free Account
                        </Link>
                    </div>
                </section>
            )}
        </div>
    );
};

export default BookHospitals;
