
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { QueueItem, QueueContextType, QueueStatus, JourneyStage, User, Hospital, HQNotification } from '../types';
import { INITIAL_QUEUE, HOSPITALS } from '../constants';

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
        // Skip if already notified or completed
        if (item.notified || item.status === QueueStatus.COMPLETED || item.date !== today) return;

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
  }, [queue]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addQueueItem = useCallback((itemData: Omit<QueueItem, 'id' | 'ticketId' | 'timestamp' | 'stage' | 'status'>) => {
    const ticketNumber = 100 + queue.length + 1;
    
    const newItem: QueueItem = {
      ...itemData,
      id: Math.random().toString(36).substr(2, 9),
      ticketId: `HQ-${ticketNumber}`,
      status: QueueStatus.PENDING,
      stage: JourneyStage.CHECK_IN,
      timestamp: Date.now(),
      notified: false
    };
    setQueue(prev => [...prev, newItem]);
    return newItem;
  }, [queue.length]);

  const acceptBooking = useCallback((id: string) => {
    setQueue(prev => prev.map(item => {
      if (item.id === id) {
        const isToday = item.date === new Date().toISOString().split('T')[0];
        return { 
          ...item, 
          status: isToday ? QueueStatus.WAITING : QueueStatus.UPCOMING 
        };
      }
      return item;
    }));
  }, []);

  const updateQueueItem = useCallback((id: string, updates: Partial<QueueItem>) => {
    setQueue(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const registerUser = useCallback((userData: Partial<User>) => {
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
  }, []);

  const registerHospitalProfile = useCallback((hospitalId: string) => {
    if (!user) return;
    const newProfile = {
      hospitalId,
      cardId: `MED-${Math.floor(100000 + Math.random() * 900000)}`,
      registrationDate: Date.now(),
      isPaid: true
    };
    setUser(prev => prev ? {
      ...prev,
      profiles: [...prev.profiles, newProfile]
    } : null);
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
