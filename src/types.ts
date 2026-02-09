
export enum QueueStatus {
  PENDING = 'Pending Approval',
  WAITING = 'Waiting',
  IN_PROGRESS = 'In Progress',
  DELAYED = 'Delayed',
  COMPLETED = 'Completed',
  UPCOMING = 'Upcoming'
}

export enum JourneyStage {
  CHECK_IN = 'Check-in',
  TRIAGE = 'Triage',
  BILLING = 'Billing',
  DOCTOR = 'Doctor',
  PHARMACY = 'Pharmacy',
  COMPLETED = 'Completed'
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  departments: string[];
  services: Record<string, string[]>;
  isOpen: boolean;
  registrationFee: number;
}

export interface UserHospitalProfile {
  hospitalId: string;
  cardId: string;
  registrationDate: number;
  isPaid: boolean;
}

export interface User {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  nextOfKin?: {
    name: string;
    relationship: string;
    phone: string;
  };
  profiles: UserHospitalProfile[];
}

export interface QueueItem {
  id: string;
  patientName: string;
  phone: string;
  ticketId: string;
  status: QueueStatus;
  stage: JourneyStage;
  hospitalId: string;
  department: string;
  service: string;
  timeSlot: string;
  date: string;
  isEmergency: boolean;
  timestamp: number;
  paymentStatus: 'Pending' | 'Paid' | 'Not Required';
  notified?: boolean; // Track if reminder was sent
  assignedStaffId?: string; // ID of the staff member assigned to this patient
}

export interface HQNotification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'update' | 'emergency';
  timestamp: number;
}

export interface QueueContextType {
  queue: QueueItem[];
  user: User | null;
  hospitals: Hospital[];
  notifications: HQNotification[];
  addQueueItem: (item: Omit<QueueItem, 'id' | 'ticketId' | 'timestamp' | 'stage' | 'status'>) => QueueItem;
  updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
  advanceQueue: (hospitalId: string, department: string) => void;
  registerUser: (userData: Partial<User>) => Promise<void>;
  registerHospitalProfile: (hospitalId: string) => Promise<void>;
  registerHospital: (hospital: Hospital) => void;
  acceptBooking: (id: string) => void;
  dismissNotification: (id: string) => void;
}
