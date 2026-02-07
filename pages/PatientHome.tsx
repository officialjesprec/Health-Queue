
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueue } from '../store/QueueContext';
import InfoTooltip from '../components/InfoTooltip';
import { HOSPITALS as INITIAL_HOSPITALS } from '../constants';

const PatientHome: React.FC = () => {
  const navigate = useNavigate();
  const { hospitals } = useQueue();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHospitals = hospitals
    .filter(h => 
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      h.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    // Sort so new hospitals (not in initial list) appear first
    .sort((a, b) => {
      const aIsNew = !INITIAL_HOSPITALS.some(h => h.id === a.id);
      const bIsNew = !INITIAL_HOSPITALS.some(h => h.id === b.id);
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      return 0;
    });

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl tracking-tight">
          Book, wait less, <br/>
          <span className="text-teal-600 italic">get treated faster.</span>
        </h1>
        <p className="text-slate-600 text-lg max-w-md mx-auto">
          HealthQueue is the digital bridge between you and Nigerian healthcare providers.
        </p>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search for a hospital, clinic or diagnostic center..."
          className="block w-full pl-12 pr-4 py-5 border-2 border-slate-100 rounded-[2rem] leading-5 bg-white shadow-xl shadow-slate-200/50 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 sm:text-lg transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Available Facilities</h2>
          <span className="text-xs font-bold text-teal-600">{filteredHospitals.length} Found</span>
        </div>
        
        <div className="grid gap-6">
          {filteredHospitals.map(hospital => {
            const isNewlyJoined = !INITIAL_HOSPITALS.some(h => h.id === hospital.id);
            return (
              <div
                key={hospital.id}
                className="group bg-white border-2 border-slate-50 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl hover:border-teal-500/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {isNewlyJoined && (
                  <div className="absolute top-0 right-0 bg-teal-600 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest animate-pulse">
                    Newly Joined
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-2xl group-hover:text-teal-700 transition-colors tracking-tight">{hospital.name}</h3>
                    <p className="text-slate-500 flex items-center mt-2 text-sm font-semibold">
                      <svg className="w-4 h-4 mr-2 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {hospital.location}
                    </p>
                  </div>
                </div>
                
                <div className="mt-5 flex flex-wrap gap-2">
                  {hospital.departments.map(dept => (
                    <span key={dept} className="inline-flex items-center px-4 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-slate-100/50">
                      <InfoTooltip term={dept} className="mr-0.5" />
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                  <Link 
                    to={`/admin/${hospital.id}/login`} 
                    className="text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest transition-all hover:tracking-[0.2em]"
                  >
                    Hospital Admin Portal
                  </Link>
                  <button
                    onClick={() => navigate(`/book/${hospital.id}`)}
                    className="px-8 py-3.5 bg-slate-900 text-white font-black text-sm rounded-2xl shadow-xl shadow-slate-200 hover:bg-teal-600 hover:shadow-teal-100 active:scale-95 transition-all"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-10 text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-3xl font-black text-white tracking-tight">Is your Hospital listed?</h3>
          <p className="text-slate-400 text-lg font-medium max-w-sm mx-auto">Digitize your queue and improve patient satisfaction in 5 minutes.</p>
          <Link 
            to="/register-hospital" 
            className="inline-block px-10 py-4 bg-teal-500 text-white font-black rounded-2xl text-sm uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 shadow-xl shadow-teal-500/20 transition-all active:scale-95"
          >
            Register My Facility
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
