import React from 'react';
import { Link } from 'react-router-dom';
import { useHospitals } from '../hooks/useHospitals';
import { useAuth } from '../hooks/useAuth';
import { Heart, MapPin, Clock, Phone, Mail, ArrowRight, Star, Activity, ShieldCheck } from 'lucide-react';

const PatientHome: React.FC = () => {
  const { hospitals, loading } = useHospitals();
  const { isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-healthcare-bg">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-medium text-slate-600">Finding best care options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-healthcare-bg font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-24 lg:py-32">
        <div className="absolute inset-0 bg-primary-50 opacity-40 -skew-y-3 origin-top-left transform translate-y-24"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-semibold mb-8 animate-fade-in">
              <Star className="w-4 h-4 fill-current" />
              <span>Trusted by 50+ Top Hospitals in Nigeria</span>
            </div>

            <h1 className="mb-6 animate-fade-in text-slate-900 tracking-tight" style={{ lineHeight: 1.1 }}>
              Your Health, <span className="text-primary-600">Simplified.</span><br />
              <span className="text-slate-400">No More Waiting.</span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Skip the chaotic waiting rooms. Book appointments instantly, track your live queue position,
              and get treated with the dignity you deserve.
            </p>

            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
                <Link to="/auth/signup" className="btn btn-primary btn-lg w-full sm:w-auto shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/auth/login" className="btn btn-outline btn-lg w-full sm:w-auto">
                  Patient Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats / Features Grid */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors">
                <Activity className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Real-Time Tracking</h3>
              <p className="text-slate-500 leading-relaxed">
                Know exactly when it's your turn. Watch your queue position update live on your phone.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-success-100 transition-colors">
                <ShieldCheck className="w-10 h-10 text-success-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Verified Hospitals</h3>
              <p className="text-slate-500 leading-relaxed">
                We only partner with accredited, high-standard medical facilities strictly vetted by our team.
              </p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
                <Heart className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Patient-First Care</h3>
              <p className="text-slate-500 leading-relaxed">
                Rate your experience and help us maintain high standards of care across the network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hospitals List */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Available Hospitals</h2>
              <p className="text-lg text-slate-600 max-w-xl">
                Choose a facility near you and book your slot instantly.
              </p>
            </div>
            <div className="hidden md:block">
              <Link to="/hospitals" className="text-primary-600 font-bold hover:text-primary-800 flex items-center gap-2">
                View All Hospitals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="group bg-white rounded-3xl p-1 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-primary-100 flex flex-col"
              >
                <div className="relative h-48 bg-slate-200 rounded-2xl overflow-hidden mb-4">
                  {/* Placeholder for hospital image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                  <div className="absolute bottom-4 left-4 z-20 text-white">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${hospital.is_open ? 'bg-success-500' : 'bg-red-500'}`}>
                      {hospital.is_open ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                </div>

                <div className="px-5 pb-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {hospital.name}
                  </h3>

                  <div className="flex items-start gap-2 text-slate-500 text-sm mb-4 min-h-[40px]">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{hospital.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {Array.isArray(hospital.departments) && hospital.departments.slice(0, 3).map((dept, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">
                        {dept}
                      </span>
                    ))}
                    {Array.isArray(hospital.departments) && hospital.departments.length > 3 && (
                      <span className="px-2 py-1 bg-slate-50 text-slate-400 text-xs font-medium rounded-lg">
                        +{hospital.departments.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-slate-400">
                      {hospital.phone ? '24/7 Support' : 'Contact Available'}
                    </div>
                    <Link
                      to={`/book/${hospital.id}`}
                      className="px-6 py-2.5 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-200"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hospitals.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No hospitals found</h3>
              <p className="text-slate-500">We couldn't load the hospital list at this moment. Please try again later.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-24 bg-primary-900 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-500 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-secondary-500 blur-3xl"></div>
          </div>

          <div className="container-custom relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Ready to skip the wait?
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Join thousands of Nigerian patients who are saving hours every week with Health Queue.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth/signup" className="btn bg-white text-primary-900 hover:bg-primary-50 btn-lg shadow-xl w-full sm:w-auto">
                Create Free Account
              </Link>
              <Link to="/auth/login" className="btn btn-outline border-primary-700 text-primary-100 hover:bg-primary-800 hover:text-white btn-lg w-full sm:w-auto">
                <Phone className="w-4 h-4" />
                Contact Support
              </Link>
            </div>

            <p className="mt-8 text-sm text-primary-400">
              No credit card required. Free for all patients.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default PatientHome;
