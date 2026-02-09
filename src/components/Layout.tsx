import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useIsStaff } from '../hooks/useAuth';
import { useQueue } from '../store/QueueContext'; // Context to sync user data
import { Logo } from './Logo';
import {
  Menu, X, User as UserIcon, LogOut,
  LayoutDashboard, Stethoscope, ChevronDown,
  Building2, Home, Info, Phone as PhoneIcon,
  CreditCard, Calendar
} from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut: authSignOut, loading: authLoading } = useAuth();
  const { user: queueUser, registerUser } = useQueue();
  const { isStaff, staffData, loading: staffLoading } = useIsStaff();

  // State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Derived state
  const isOnAdminPath = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname.startsWith('/auth');

  // Sync Supabase Auth with Queue Context (Preserved Logic)
  useEffect(() => {
    if (user && !queueUser) {
      // Safe access to user metadata
      const meta = user.user_metadata || {};
      registerUser({
        id: user.id,
        fullName: meta.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: user.phone || meta.phone || '',
        profiles: []
      });
    }
  }, [user, queueUser, registerUser]);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Click outside handler for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dashboard Navigation Logic
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (staffLoading) return;

    if (isStaff) {
      if (staffData?.role === 'admin' && staffData.hospital_id) {
        navigate(`/admin/${staffData.hospital_id}/dashboard`);
      } else {
        navigate('/staff/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
    setIsProfileOpen(false);
  };

  // Determine User Name & Initials
  const getDisplayName = () => {
    if (isStaff && staffData?.full_name) return staffData.full_name;
    const meta = user?.user_metadata || {};
    return meta.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const getUserRoleLabel = () => {
    if (isStaff) {
      if (staffData?.role === 'admin') return 'Hospital Admin';
      return 'Medical Staff';
    }
    return 'Patient';
  };

  // Render Auth Page Simplified Layout
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-healthcare-bg">
        {children}
      </div>
    );
  }

  // Common Nav Links
  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Hospitals', path: '/hospitals', icon: Building2 },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-healthcare-bg">
      {/* Header */}
      <header className={`border-b sticky top-0 z-50 shadow-sm transition-all duration-300 ${isStaff
          ? 'bg-slate-900 border-slate-800 text-white'
          : 'bg-white border-slate-200 text-slate-900'
        }`}>        <div className="container-custom">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 z-50 relative group">
              <Logo variant="full" width={40} height={40} showText={true} />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {/* Main Links */}
              {!isStaff && !isOnAdminPath && (
                <nav className="flex items-center gap-6">
                  {navLinks.map(link => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-sm font-medium transition-colors hover:text-teal-400 ${location.pathname === link.path ? 'text-teal-400 font-bold' : (isStaff ? 'text-slate-300' : 'text-slate-600')
                        }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
              )}

              {isStaff && (
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400">
                      Hospital Management System
                    </span>
                  </div>
                </div>
              )}

              {/* Right Side Actions */}
              <div className="flex items-center gap-4">
                {!user ? (
                  <>
                    <Link to="/partner" className="text-sm font-bold text-slate-500 hover:text-teal-600 mr-2 flex items-center gap-1">
                      <Building2 className="w-4 h-4" /> For Hospitals
                    </Link>
                    <div className="h-6 w-px bg-slate-200 mx-1"></div>
                    <Link to="/auth/login" className="btn-ghost btn-sm">Sign In</Link>
                    <Link to="/auth/signup" className="btn-primary btn-sm shadow-md hover:shadow-lg transition-all">Get Started</Link>
                  </>
                ) : (
                  <div className="flex items-center gap-4" ref={profileRef}>
                    {/* Book Now Button (Only for Non-Admin) */}
                    {!isOnAdminPath && !isStaff && (
                      <Link to="/hospitals" className="hidden lg:flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full font-bold text-xs hover:bg-teal-100 transition-colors">
                        <Stethoscope className="w-4 h-4" />
                        <span>Book Appointment</span>
                      </Link>
                    )}

                    {/* Profile Dropdown Toggle */}
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className={`flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-teal-100 group ${isStaff
                          ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
                          : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm group-hover:scale-105 transition-transform ${isStaff ? 'bg-teal-500 text-slate-900' : 'bg-teal-600 text-white'
                        }`}>
                        {getInitials()}
                      </div>
                      <div className="hidden lg:block text-left mr-1">
                        <p className={`text-[10px] font-black leading-none uppercase tracking-wide ${isStaff ? 'text-white' : 'text-slate-900'}`}>{user.user_metadata?.full_name?.split(' ')[0] || 'User'}</p>
                        <p className={`text-[9px] font-medium leading-none mt-0.5 ${isStaff ? 'text-slate-400' : 'text-slate-500'}`}>{getUserRoleLabel()}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''} ${isStaff ? 'text-slate-500' : 'text-slate-400'}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-3 bg-slate-50 rounded-xl mb-1 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-teal-600 font-bold shadow-sm">
                            {getInitials()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-slate-900 text-sm truncate">{getDisplayName()}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <button onClick={handleDashboardClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-teal-700 transition-colors text-sm font-medium">
                            <LayoutDashboard className="w-4 h-4" />
                            {isStaff ? (staffData?.role === 'admin' ? 'Admin Dashboard' : 'Staff Dashboard') : 'Patient Dashboard'}
                          </button>
                          {!isStaff && (
                            <Link to="/hospitals" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 hover:text-teal-700 transition-colors text-sm font-medium" onClick={() => setIsProfileOpen(false)}>
                              <Stethoscope className="w-4 h-4" />
                              Book Appointment
                            </Link>
                          )}
                          {/* Add more links here if needed */}
                        </div>

                        <div className="h-px bg-slate-100 my-1 mx-2"></div>

                        <button
                          onClick={() => authSignOut()}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors text-sm font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-[80%] max-w-xs bg-white shadow-2xl p-6 flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <Logo variant="full" width={32} height={32} showText={true} />
              <button onClick={() => setIsMobileOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-grow space-y-6 overflow-y-auto">
              {user && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                      {getInitials()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 line-clamp-1">{getDisplayName()}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${isStaff
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : 'bg-teal-50 text-teal-600 border-teal-100'
                          }`}>
                          {getUserRoleLabel()}
                        </span>
                        {isStaff && (
                          <span className="text-[9px] font-bold text-slate-400">Hospital Admin</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={handleDashboardClick} className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-black shadow-lg shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 mb-2">
                    <LayoutDashboard className="w-4 h-4" />
                    {isStaff ? 'Back to Admin Hub' : 'My Health Dashboard'}
                  </button>
                  {isStaff && (
                    <p className="text-[10px] text-center text-slate-400 font-medium">Switching to administrative view...</p>
                  )}
                </div>
              )}

              <nav className="space-y-2">
                <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Navigation</p>
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === link.path ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                ))}
              </nav>

              {!user && (
                <div className="pt-4 space-y-3">
                  <Link to="/auth/login" className="w-full btn btn-outline justify-center">Sign In</Link>
                  <Link to="/auth/signup" className="w-full btn btn-primary justify-center">Get Started</Link>
                  <Link to="/partner" className="w-full btn btn-ghost justify-center text-slate-500 text-sm">For Hospitals</Link>
                </div>
              )}
            </div>

            {user && (
              <div className="pt-6 border-t border-slate-100">
                <button onClick={authSignOut} className="w-full flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 px-4 py-3 rounded-xl transition-colors">
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-12">
        <div className="container-custom">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Logo variant="icon" width={40} height={40} />
            </div>
            <p className="text-slate-400">Making healthcare accessible and efficient for everyone</p>
            <div className="flex justify-center gap-6 text-sm text-slate-400">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-slate-500">© 2026 HealthQueue. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
