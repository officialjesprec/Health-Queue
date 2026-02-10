import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '../types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

type QueueItem = Database['public']['Tables']['queue_items']['Row'];
type QueueInsert = Database['public']['Tables']['queue_items']['Insert'];
type QueueUpdate = Database['public']['Tables']['queue_items']['Update'];

export function useQueue(hospitalId?: string) {
    const { user } = useAuth();
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user && !hospitalId) return;

        fetchQueue();

        // Subscribe to realtime updates
        const channel = setupRealtimeSubscription();

        return () => {
            channel?.unsubscribe();
        };
    }, [user, hospitalId]);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            let query = supabase.from('queue_items').select('*');

            if (hospitalId) {
                query = query.eq('hospital_id', hospitalId);
            } else if (user) {
                query = query.eq('patient_id', user.id);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setQueue(data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = (): RealtimeChannel => {
        const channel = supabase
            .channel('queue_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'queue_items',
                    filter: hospitalId ? `hospital_id=eq.${hospitalId}` : user ? `patient_id=eq.${user.id}` : undefined,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setQueue((prev) => [payload.new as QueueItem, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setQueue((prev) =>
                            prev.map((item) =>
                                item.id === payload.new.id ? (payload.new as QueueItem) : item
                            )
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setQueue((prev) => prev.filter((item) => item.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return channel;
    };

    const addQueueItem = async (item: Omit<QueueInsert, 'patient_id'>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { data, error } = await supabase
                .from('queue_items')
                .insert({
                    ...item,
                    patient_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            throw err;
        }
    };

    const updateQueueItem = async (id: string, updates: QueueUpdate) => {
        try {
            const { data, error } = await supabase
                .from('queue_items')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (err) {
            throw err;
        }
    };

    const deleteQueueItem = async (id: string) => {
        try {
            const { error } = await supabase
                .from('queue_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            throw err;
        }
    };

    return {
        queue,
        loading,
        error,
        refetch: fetchQueue,
        addQueueItem,
        updateQueueItem,
        deleteQueueItem,
    };
}

// Get queue for specific department
export function useDepartmentQueue(hospitalId: string, department: string) {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!hospitalId || !department) return;

        fetchDepartmentQueue();

        // Subscribe to realtime updates
        const channel = supabase
            .channel(`dept_${department}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'queue_items',
                    filter: `hospital_id=eq.${hospitalId}`,
                },
                (payload) => {
                    const item = payload.new as QueueItem;
                    if (item.department !== department) return;

                    if (payload.eventType === 'INSERT') {
                        setQueue((prev) => [...prev, item]);
                    } else if (payload.eventType === 'UPDATE') {
                        setQueue((prev) =>
                            prev.map((q) => (q.id === item.id ? item : q))
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setQueue((prev) => prev.filter((q) => q.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [hospitalId, department]);

    const fetchDepartmentQueue = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('queue_items')
                .select('*')
                .eq('hospital_id', hospitalId)
                .eq('department', department)
                .in('status', ['pending', 'waiting', 'in_progress'])
                .order('queue_position');

            if (error) throw error;
            setQueue(data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { queue, loading, error, refetch: fetchDepartmentQueue };
}

// Get single queue item by ticket ID
export function useQueueItem(ticketId: string) {
    const [queueItem, setQueueItem] = useState<QueueItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!ticketId) return;

        fetchQueueItem();

        // Subscribe to realtime updates
        const channel = supabase
            .channel(`ticket_${ticketId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'queue_items',
                    filter: `ticket_id=eq.${ticketId}`,
                },
                (payload) => {
                    setQueueItem(payload.new as QueueItem);
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [ticketId]);

    const fetchQueueItem = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('queue_items')
                .select('*')
                .eq('ticket_id', ticketId)
                .single();

            if (error) throw error;
            setQueueItem(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    };

    return { queueItem, loading, error, refetch: fetchQueueItem };
}
