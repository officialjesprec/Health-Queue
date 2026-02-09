import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useIsStaff } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('patient' | 'staff' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading: authLoading, isAuthenticated } = useAuth();
    const { isStaff, staffData, loading: staffLoading } = useIsStaff();
    const location = useLocation();

    if (authLoading || staffLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-healthcare-bg">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium font-heading">Verifying Access...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but save the current location they were trying to go to
        const loginPath = allowedRoles?.includes('staff') || allowedRoles?.includes('admin')
            ? '/hospital/login'
            : '/auth/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Role-based authorization
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = isStaff ? (staffData?.role === 'admin' ? 'admin' : 'staff') : 'patient';

        if (!allowedRoles.includes(userRole)) {
            // User is authenticated but doesn't have the right role
            // Redirect to their appropriate dashboard
            const dashboardPath = isStaff
                ? (staffData?.role === 'admin' ? `/admin/${staffData.hospital_id}/dashboard` : '/staff/dashboard')
                : '/dashboard';

            return <Navigate to={dashboardPath} replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
