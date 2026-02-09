import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAuthenticated: boolean;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        session: null,
        loading: true,
        isAuthenticated: false,
    });

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthState({
                user: session?.user ?? null,
                session,
                loading: false,
                isAuthenticated: !!session,
            });
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthState({
                user: session?.user ?? null,
                session,
                loading: false,
                isAuthenticated: !!session,
            });
        });

        return () => subscription.unsubscribe();
    }, []);

    // Sign up with email and password
    const signUp = async (email: string, password: string, userData: {
        fullName: string;
        phone: string;
        dateOfBirth?: string;
        gender?: string;
        role?: string;
        [key: string]: any;
    }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: userData.fullName,
                    ...userData, // Spread other fields like role, hospitalNameInitial
                },
            },
        });

        if (error) throw error;

        return data;
    };

    // Sign in with email and password
    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    };

    // Sign out
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    // Reset password
    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw error;
    };

    // Update password
    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) throw error;
    };

    return {
        ...authState,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
    };
}

// Hook for checking if user is a patient
export function useIsPatient() {
    const { user } = useAuth();
    const [isPatient, setIsPatient] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkPatient = async () => {
            if (!user) {
                setIsPatient(false);
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('users')
                .select('id')
                .eq('id', user.id)
                .single();

            setIsPatient(!!data);
            setLoading(false);
        };

        checkPatient();
    }, [user]);

    return { isPatient, loading };
}

// Hook for checking if user is staff
export function useIsStaff() {
    const { user } = useAuth();
    const [isStaff, setIsStaff] = useState(false);
    const [staffData, setStaffData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkStaff = async () => {
            if (!user) {
                setIsStaff(false);
                setStaffData(null);
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from('staff')
                .select('*')
                .eq('id', user.id)
                .single();

            setIsStaff(!!data);
            setStaffData(data);
            setLoading(false);
        };

        checkStaff();
    }, [user]);

    return { isStaff, staffData, loading };
}
