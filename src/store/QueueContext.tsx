
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { QueueItem, QueueContextType, QueueStatus, JourneyStage, User, Hospital, HQNotification } from '../types';
import { INITIAL_QUEUE, HOSPITALS } from '../constants';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const saved = localStorage.getItem('hq_queue');
    return saved ? JSON.parse(saved) : INITIAL_QUEUE;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('hq_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const saved = localStorage.getItem('hq_hospitals');
    return saved ? JSON.parse(saved) : HOSPITALS;
  });

  const [notifications, setNotifications] = useState<HQNotification[]>([]);

  useEffect(() => {
    localStorage.setItem('hq_queue', JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem('hq_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('hq_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  // --- Notification Engine ---
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      queue.forEach(item => {
        // --- FIX: Notification Bombing ---
        // Only notify if the item belongs to the currently logged in patient
        // We compare by fullName or phone as a fallback in this version
        const isOwnItem = user && (
          (item.patientName === user.fullName) ||
          (item.phone === user.phone)
        );

        // Skip if not own item, already notified, completed, or not today
        if (!isOwnItem || item.notified || item.status === QueueStatus.COMPLETED || item.date !== today) return;

        let shouldNotify = false;
        let notificationTitle = "";
        let notificationMsg = "";

        // 1. Time-based check (10 mins prior)
        if (item.timeSlot && item.timeSlot !== 'ASAP' && item.timeSlot !== 'Now') {
          try {
            const [time, modifier] = item.timeSlot.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            const apptTime = new Date();
            apptTime.setHours(hours, minutes, 0, 0);

            const diffInMins = (apptTime.getTime() - now.getTime()) / (1000 * 60);

            if (diffInMins > 0 && diffInMins <= 10) {
              shouldNotify = true;
              notificationTitle = "Upcoming Appointment";
              notificationMsg = `Your ${item.service} session starts in ${Math.round(diffInMins)} mins. Please head to the hospital.`;
            }
          } catch (e) {
            console.error("Time parse error", e);
          }
        }

        // 2. Proximity-based check (Position < 3)
        if (!shouldNotify && item.status === QueueStatus.WAITING) {
          const deptQueue = queue.filter(q =>
            q.hospitalId === item.hospitalId &&
            q.department === item.department &&
            q.status !== QueueStatus.COMPLETED &&
            q.date === today
          );
          const pos = deptQueue.findIndex(q => q.id === item.id) + 1;

          if (pos > 0 && pos <= 3) {
            shouldNotify = true;
            notificationTitle = "You are almost next!";
            notificationMsg = `Queue Position: #${pos}. Please stay within walking distance of the ${item.department} ward.`;
          }
        }

        if (shouldNotify) {
          const newNotif: HQNotification = {
            id: Math.random().toString(36).substr(2, 9),
            title: notificationTitle,
            message: notificationMsg,
            type: 'reminder',
            timestamp: Date.now()
          };

          setNotifications(prev => [...prev, newNotif]);
          // Mark as notified so we don't spam
          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, notified: true } : q));
        }
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [queue, user]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // --- Fetch Queue from DB ---
  useEffect(() => {
    const fetchQueueItems = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('queue_items')
          .select('*')
          .eq('appointment_date', today);

        if (data) {
          // Map DB items to local shape if needed (snake_case -> camelCase)
          const mapped: QueueItem[] = data.map((item: any) => ({
            id: item.id,
            ticketId: item.ticket_id,
            patientName: item.patient_name,
            phone: item.phone,
            status: item.status,
            stage: item.stage,
            hospitalId: item.hospital_id,
            department: item.department,
            service: item.service,
            timeSlot: item.time_slot,
            date: item.appointment_date,
            isEmergency: item.is_emergency,
            timestamp: new Date(item.created_at || Date.now()).getTime(),
            paymentStatus: item.payment_status,
            assignedStaffId: item.assigned_staff_id,
            notified: item.notified
          }));
          setQueue(mapped);
        }
      } catch (err) {
        console.error("Error fetching queue:", err);
      }
    };

    fetchQueueItems();

    // Real-time Subscription
    const channel = supabase
      .channel('public:queue_items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_items' }, (payload) => {
        fetchQueueItems(); // Simplest approach: refetch all on change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Run once on mount

  const addQueueItem = useCallback(async (itemData: Omit<QueueItem, 'id' | 'ticketId' | 'timestamp' | 'stage' | 'status'>) => {
    // Generate Ticket ID
    // Ideally this should be done by DB trigger or sequence, but for now:
    const randomTicket = Math.floor(100 + Math.random() * 900);
    const ticketId = `HQ-${randomTicket}`;

    const newItem = {
      patient_name: itemData.patientName,
      phone: itemData.phone,
      hospital_id: itemData.hospitalId,
      department: itemData.department,
      service: itemData.service,
      time_slot: itemData.timeSlot,
      appointment_date: itemData.date,
      is_emergency: itemData.isEmergency,
      payment_status: itemData.paymentStatus,
      status: QueueStatus.PENDING,
      stage: JourneyStage.CHECK_IN,
      ticket_id: ticketId,
      patient_id: user?.id // Link to user if logged in
    };

    try {
      const { data, error } = await supabase
        .from('queue_items')
        .insert(newItem as any)
        .select()
        .single();

      if (error) {
        console.error("Failed to add queue item:", error);
        // Fallback to local only for UX if DB fails (offline mode?)
        // For now, let's just throw or return mock
        const mockItem: QueueItem = {
          ...itemData,
          id: Math.random().toString(36).substr(2, 9),
          ticketId,
          status: QueueStatus.PENDING,
          stage: JourneyStage.CHECK_IN,
          timestamp: Date.now(),
          notified: false
        };
        setQueue(prev => [...prev, mockItem]);
        return mockItem;
      }

      if (data) {
        const d = data as any;
        const mapped: QueueItem = {
          id: d.id,
          ticketId: d.ticket_id,
          patientName: d.patient_name,
          phone: d.phone,
          status: d.status,
          stage: d.stage,
          hospitalId: d.hospital_id,
          department: d.department,
          service: d.service,
          timeSlot: d.time_slot,
          date: d.date,
          isEmergency: d.is_emergency,
          timestamp: new Date(d.created_at).getTime(),
          paymentStatus: d.payment_status,
          assignedStaffId: d.assigned_staff_id,
          notified: d.notified
        };
        setQueue(prev => [...prev, mapped]);
        return mapped;
      }
    } catch (e) {
      console.error(e);
    }

    // Fallback return (should technically throw)
    throw new Error("Failed to create appointment");
  }, [user]);

  const acceptBooking = useCallback((id: string) => {
    // Optimistic update
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        const isToday = item.date === new Date().toISOString().split('T')[0];
        const newStatus = isToday ? QueueStatus.WAITING : QueueStatus.UPCOMING;

        // Sync to DB
        (supabase.from('queue_items') as any).update({ status: newStatus }).eq('id', id).then();

        return {
          ...item,
          status: newStatus
        };
      }
      return item;
    }));
  }, []);

  const updateQueueItem = useCallback((id: string, updates: Partial<QueueItem>) => {
    // Determine DB columns to update based on keys
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.stage) dbUpdates.stage = updates.stage;
    if (updates.assignedStaffId) dbUpdates.assigned_staff_id = updates.assignedStaffId;
    if (updates.notified !== undefined) dbUpdates.notified = updates.notified;

    // Optimistic
    setQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));

    // Sync
    if (Object.keys(dbUpdates).length > 0) {
      (supabase.from('queue_items') as any).update(dbUpdates).eq('id', id).then(({ error }: any) => {
        if (error) console.error("Failed to update queue item:", error);
      });
    }
  }, []);

  const registerUser = useCallback(async (userData: Partial<User>) => {
    setUser(prev => {
      const newUser = {
        id: prev?.id || Math.random().toString(36).substr(2, 9),
        fullName: userData.fullName || prev?.fullName || '',
        phone: userData.phone || prev?.phone || '',
        profiles: prev?.profiles || [],
        ...userData
      } as User;
      return newUser;
    });

    // If we have an authenticated user, we should ideally sync this to public.users
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        const { error } = await (supabase as any)
          .from('users')
          .update({
            full_name: userData.fullName,
            phone: userData.phone,
            date_of_birth: userData.dateOfBirth,
            gender: userData.gender,
            address: userData.address,
            next_of_kin: userData.nextOfKin
          })
          .eq('id', session.user.id);

        if (error) console.error('Error syncing user to DB:', error);
      } catch (err) {
        console.error('Failed to sync user:', err);
      }
    }
  }, []);

  const registerHospitalProfile = useCallback(async (hospitalId: string) => {
    if (!user) return;

    const cardId = `MED-${Math.floor(100000 + Math.random() * 900000)}`;
    const newProfile = {
      hospitalId,
      cardId,
      registrationDate: Date.now(),
      isPaid: true
    };

    // Update local state
    setUser(prev => prev ? {
      ...prev,
      profiles: [...prev.profiles, newProfile]
    } : null);

    // Persist to Supabase hospital_profiles
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        const { error } = await (supabase as any)
          .from('hospital_profiles')
          .insert({
            user_id: session.user.id,
            hospital_id: hospitalId,
            card_id: cardId,
            is_paid: true
          });

        if (error) {
          console.error('Error saving hospital profile to DB:', error);
          if (error.code !== '23505') { // Ignore unique constraint if they already have one
            toast.error('Failed to save medical card online, but it is saved locally.');
          }
        }
      } catch (err) {
        console.error('Failed to persist profile:', err);
      }
    }
  }, [user]);

  const registerHospital = useCallback((hospital: Hospital) => {
    setHospitals(prev => [...prev, hospital]);
  }, []);

  const advanceQueue = useCallback((hospitalId: string, department: string) => {
    setQueue(prev => {
      const today = new Date().toISOString().split('T')[0];
      const todayQueue = prev.filter(q => q.date === today && q.hospitalId === hospitalId && q.department === department);
      const currentlyInProgress = todayQueue.find(q => q.status === QueueStatus.IN_PROGRESS);
      const nextWaiting = todayQueue.find(q => q.status === QueueStatus.WAITING);

      let newQueue = [...prev];
      if (currentlyInProgress) {
        newQueue = newQueue.map(q => q.id === currentlyInProgress.id ? { ...q, status: QueueStatus.COMPLETED } : q);
      }
      if (nextWaiting) {
        newQueue = newQueue.map(q => q.id === nextWaiting.id ? { ...q, status: QueueStatus.IN_PROGRESS } : q);
      }
      return newQueue;
    });
  }, []);

  return (
    <QueueContext.Provider value={{
      queue,
      user,
      hospitals,
      notifications,
      addQueueItem,
      updateQueueItem,
      advanceQueue,
      registerUser,
      registerHospitalProfile,
      registerHospital,
      acceptBooking,
      dismissNotification
    }}>
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) throw new Error('useQueue must be used within a QueueProvider');
  return context;
};
