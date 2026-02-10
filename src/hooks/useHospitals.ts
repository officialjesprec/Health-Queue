import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Hospital = Database['public']['Tables']['hospitals']['Row'];

export function useHospitals() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchHospitals();
    }, []);

    const fetchHospitals = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('hospitals')
                .select('*')
                .eq('is_open', true)
                .order('name');

            if (error) throw error;
            setHospitals(data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    const getHospitalById = (id: string) => {
        return hospitals.find((h) => h.id === id);
    };

    return {
        hospitals,
        loading,
        error,
        refetch: fetchHospitals,
        getHospitalById,
    };
}

export function useHospital(hospitalId: string) {
    const [hospital, setHospital] = useState<Hospital | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!hospitalId) {
            setLoading(false);
            return;
        }

        const fetchHospital = async () => {
            try {
                setLoading(true);
                setError(null);
                const { data, error } = await supabase
                    .from('hospitals')
                    .select('*')
                    .eq('id', hospitalId)
                    .maybeSingle();

                if (error) throw error;
                if (!data) {
                    console.warn(`Hospital with ID ${hospitalId} not found in Supabase`);
                }
                setHospital(data);
            } catch (err) {
                console.error('Error in useHospital:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchHospital();
    }, [hospitalId]);

    return { hospital, loading, error };
}
