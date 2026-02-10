import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    adminData: any;
    isStaff: boolean;
    staffData: any;
    isPatient: boolean;
    adminLoading: boolean;
    staffLoading: boolean;
    patientLoading: boolean;
    signUp: (email: string, password: string, userData: any) => Promise<any>;
    signIn: (email: string, password: string) => Promise<any>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const [isAdmin, setIsAdmin] = useState(false);
    const [adminData, setAdminData] = useState<any>(null);
    const [adminLoading, setAdminLoading] = useState(false);

    const [isStaff, setIsStaff] = useState(false);
    const [staffData, setStaffData] = useState<any>(null);
    const [staffLoading, setStaffLoading] = useState(false);

    const [isPatient, setIsPatient] = useState(false);
    const [patientLoading, setPatientLoading] = useState(false);

    const fetchProfile = async (currentUser: User) => {
        setAdminLoading(true);
        setStaffLoading(true);
        setPatientLoading(true);

        try {
            // Check Admin
            const { data: admin } = await supabase.from('admins').select('*').eq('id', currentUser.id).maybeSingle();

            // Check Staff (wait for staff query)
            const { data: staff } = await supabase.from('staff').select('*').eq('id', currentUser.id).maybeSingle();

            setIsAdmin(!!admin || (staff && (staff as any).role === 'admin'));
            setAdminData(admin);

            // Check Staff
            setIsStaff(!!staff);
            setStaffData(staff);

            // Check Patient
            const { data: patient } = await supabase.from('users').select('*').eq('id', currentUser.id).maybeSingle();
            setIsPatient(!!patient);
        } catch (err) {
            console.error('Error fetching profiles:', err);
        } finally {
            setAdminLoading(false);
            setStaffLoading(false);
            setPatientLoading(false);
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user);
            } else {
                setIsAdmin(false);
                setAdminData(null);
                setIsStaff(false);
                setStaffData(null);
                setIsPatient(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, userData: any) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: userData.fullName,
                    ...userData,
                },
            },
        });
        if (error) throw error;
        return data;
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setAdminData(null);
    };

    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    };

    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user);
    };

    const value = {
        user,
        session,
        loading,
        isAuthenticated: !!session,
        isAdmin,
        adminData,
        isStaff,
        staffData,
        isPatient,
        adminLoading,
        staffLoading,
        patientLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile
    };

    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Legacy-ish hooks updated to use context
export function useIsPatient() {
    const { isPatient, patientLoading: loading } = useAuth();
    return { isPatient, loading };
}

export function useIsAdmin() {
    const { isAdmin, adminData, adminLoading: loading } = useAuth();
    return { isAdmin, adminData, loading };
}

export function useIsStaff() {
    const { isStaff, staffData, staffLoading: loading } = useAuth();
    return { isStaff, staffData, loading };
}
