import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useIsStaff } from '../hooks/useAuth';
import { useQueue } from '../store/QueueContext';
import { Logo } from './Logo';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut: authSignOut, loading } = useAuth(); // Modified useAuth destructuring
  const { user: queueUser, registerUser } = useQueue(); // Added useQueue destructuring
  const { isStaff, staffData, loading: staffLoading } = useIsStaff(); // Check if user is staff
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname.startsWith('/auth');

  // Sync Supabase Auth with Queue Context
  useEffect(() => { // Changed React.useEffect to useEffect
    if (user && !queueUser) {
      // Check if we need to sync basic info
      registerUser({
        id: user.id,
        fullName: user.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        phone: user.phone || '',
        // Initialize empty profiles if fetching fails or not yet implemented
        profiles: []
      });
    }
  }, [user, queueUser, registerUser]);
  const { isAuthenticated } = useAuth(); // Kept this line as per instruction, though it's redundant with `user`

  // Handle dashboard link click - route based on user type
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (staffLoading) return; // Wait for staff check to complete

    if (isStaff && staffData?.hospital_id) {
      // Staff user - go to their hospital's admin dashboard
      navigate(`/admin/${staffData.hospital_id}/dashboard`);
    } else {
      // Regular patient - go to patient dashboard
      navigate('/dashboard');
    }
  };

  // Simple layout for auth pages
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-healthcare-bg">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-healthcare-bg">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container-custom">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Logo variant="full" width={48} height={48} showText={true} />
            </Link>

            <nav className="flex items-center gap-4">
              {!isAdmin ? (
                <>
                  {isAuthenticated ? (
                    <>
                      <a
                        href="#"
                        onClick={handleDashboardClick}
                        className="btn-ghost btn-sm flex items-center gap-2"
                      >
                        Dashboard
                        {staffLoading && <span className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>}
                      </a>
                      <button onClick={authSignOut} className="btn-ghost btn-sm text-red-500 hover:bg-red-50 hover:text-red-600">
                        Sign Out
                      </button>
                      <Link to="/hospitals" className="btn-primary btn-sm">
                        Book Now
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/register-hospital" className="text-sm font-bold text-slate-500 hover:text-teal-600 mr-2">
                        For Hospitals
                      </Link>
                      <Link to="/auth/login" className="btn-ghost btn-sm">
                        Sign In
                      </Link>
                      <Link to="/auth/signup" className="btn-primary btn-sm">
                        Get Started
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <Link to="/" className="btn-ghost btn-sm">
                  Patient View
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

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
