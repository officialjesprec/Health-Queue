import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import { QueueProvider } from './store/QueueContext';
import ProtectedRoute from './components/ProtectedRoute';

// Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-healthcare-bg">
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-6"></div>
      <p className="text-xl font-medium text-slate-600">Loading...</p>
    </div>
  </div>
);

// Lazy Loaded Pages
const Landing = React.lazy(() => import('./pages/Landing'));
const HospitalWelcome = React.lazy(() => import('./pages/HospitalWelcome')); // New
const PatientHome = React.lazy(() => import('./pages/PatientHome'));
const BookingFlow = React.lazy(() => import('./pages/BookingFlow'));
const BookHospitals = React.lazy(() => import('./pages/BookHospitals'));
const QueueStatus = React.lazy(() => import('./pages/QueueStatus'));
const PatientDashboard = React.lazy(() => import('./pages/PatientDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const StaffLogin = React.lazy(() => import('./pages/auth/StaffLogin')); // New
const StaffDashboard = React.lazy(() => import('./pages/StaffDashboard')); // New
const HospitalRegistration = React.lazy(() => import('./pages/HospitalRegistration'));
const CaregiverView = React.lazy(() => import('./pages/CaregiverView'));

// Auth Pages
const PatientLogin = React.lazy(() => import('./pages/auth/PatientLogin'));
const PatientSignup = React.lazy(() => import('./pages/auth/PatientSignup'));
const HospitalLogin = React.lazy(() => import('./pages/auth/HospitalLogin'));
const HospitalSignup = React.lazy(() => import('./pages/auth/AdminSignup')); // Redirected name
const AdminSignup = React.lazy(() => import('./pages/auth/AdminSignup'));

const App: React.FC = () => {
  return (
    <>
      <Router>
        <QueueProvider>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PatientHome />} />
                <Route path="/landing" element={<Landing />} />

                {/* Partner Portal Landing */}
                <Route path="/partner" element={<HospitalWelcome />} />

                {/* Auth Routes */}
                <Route path="/auth/login" element={<PatientLogin />} />
                <Route path="/auth/signup" element={<PatientSignup />} />

                {/* Hospital Auth Routes */}
                <Route path="/hospital/signup" element={<AdminSignup />} />
                <Route path="/admin/signup" element={<AdminSignup />} />
                <Route path="/hospital/login" element={<HospitalLogin />} />

                {/* Staff Auth Routes */}
                <Route path="/staff/login" element={<StaffLogin />} />

                {/* Patient Routes */}
                <Route path="/hospitals" element={<BookHospitals />} />
                <Route path="/book/:hospitalId" element={<BookingFlow />} />
                <Route path="/status/:ticketId" element={<QueueStatus />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/caregiver/:ticketId" element={<CaregiverView />} />

                {/* Hospital Routes */}
                <Route path="/register-hospital" element={<HospitalRegistration />} />

                {/* Admin Routes */}
                <Route path="/admin/:hospitalId/login" element={<AdminLogin />} />
                <Route
                  path="/admin/:hospitalId/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'hospital_admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Staff Routes */}
                <Route
                  path="/staff/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['staff', 'admin']}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </Layout>
        </QueueProvider>
      </Router>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#134E4A',
            border: '2px solid #0891B2',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default App;
