
import { Hospital, QueueStatus, JourneyStage, QueueItem } from './types';

export const MEDICAL_TERMS_SIMPLE: Record<string, string> = {
  'OPD': 'General clinic for regular checkups',
  'Dental': 'Everything related to teeth and gum health',
  'Antenatal': 'Special care for pregnant mothers',
  'Lab': 'Blood and urine tests to find causes of sickness',
  'Radiotherapy': 'Radiation treatment for cancer patients',
  'Pediatrics': 'Medical care specifically for children',
  'Pharmacy': 'Where you get your prescribed medicines',
  'Surgery': 'Operations and wound care',
  'Cardiology': 'Heart health and treatment',
  'Emergency': 'Immediate care for life-threatening issues',
  'Diagnostics': 'Advanced scans like X-rays and MRI',
  'Triage': 'Quick check-up to see how urgent your case is',
  'Billing': 'Paying for your treatment and hospital cards',
  'General Consultation': 'Speaking with a doctor about common sickness',
  'Immunization': 'Giving injections (vaccines) to prevent diseases',
  'NHIS Clinic': 'For patients using National Health Insurance',
  'Scaling & Polishing': 'Professional teeth cleaning',
  'Root Canal': 'Fixing a badly decayed or infected tooth',
  'Ultrasound Scan': 'Using sound waves to see a baby or internal organs',
  'ECG/EKG': 'Checking your heart beat pattern',
  'Echo Cardiogram': 'A video scan of your heart',
  'Endoscopy': 'Looking inside your body with a small camera',
  'Mammography': 'Special X-ray for breast health check'
};

export const HOSPITALS: Hospital[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Lagos University Teaching Hospital (LUTH)',
    location: 'Idi-Araba, Lagos',
    departments: ['OPD', 'Dental', 'Antenatal', 'Lab', 'Radiotherapy'],
    services: {
      'OPD': ['General Consultation', 'Immunization', 'Family Medicine', 'NHIS Clinic'],
      'Dental': ['Tooth Extraction', 'Root Canal', 'Scaling & Polishing', 'Orthodontics'],
      'Antenatal': ['Pregnancy Checkup', 'Postnatal Care', 'Ultrasound Scan'],
      'Lab': ['Blood Test', 'Urinalysis', 'Biopsy', 'HIV Screening'],
      'Radiotherapy': ['Cancer Treatment', 'CT Simulation', 'Brachytherapy']
    },
    isOpen: true,
    registrationFee: 2500
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    name: 'Ilorin General Hospital',
    location: 'Ilorin, Kwara State',
    departments: ['OPD', 'Pediatrics', 'Pharmacy', 'Surgery'],
    services: {
      'OPD': ['General Checkup', 'Malaria Treatment', 'Blood Pressure Check'],
      'Pediatrics': ['Child Welfare', 'Vaccination', 'Pediatric Surgery'],
      'Pharmacy': ['Drug Refill', 'Medication Counseling'],
      'Surgery': ['Minor Surgery', 'Orthopedic Consultation', 'Wound Dressing']
    },
    isOpen: true,
    registrationFee: 1500
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    name: 'Reddington Hospital',
    location: 'Victoria Island, Lagos',
    departments: ['OPD', 'Cardiology', 'Emergency', 'Diagnostics'],
    services: {
      'OPD': ['Executive Wellness Check', 'Specialist Consultation'],
      'Cardiology': ['ECG/EKG', 'Echo Cardiogram', 'Stress Test', 'Heart Surgery'],
      'Emergency': ['Trauma Care', 'Ambulance Service', 'Acute Care'],
      'Diagnostics': ['MRI Scan', 'CT Scan', 'Endoscopy', 'Mammography']
    },
    isOpen: true,
    registrationFee: 5000
  }
];

export const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'q1',
    patientName: 'Aisha Bello',
    phone: '08012345678',
    ticketId: 'HQ-101',
    status: QueueStatus.IN_PROGRESS,
    stage: JourneyStage.DOCTOR,
    hospitalId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    department: 'OPD',
    service: 'General Consultation',
    timeSlot: '09:00 AM',
    date: new Date().toISOString().split('T')[0],
    isEmergency: false,
    timestamp: Date.now() - 3600000,
    paymentStatus: 'Paid',
    assignedStaffId: undefined
  },
  {
    id: 'q2',
    patientName: 'Tunde Afolayan',
    phone: '08087654321',
    ticketId: 'HQ-102',
    status: QueueStatus.WAITING,
    stage: JourneyStage.TRIAGE,
    hospitalId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    department: 'OPD',
    service: 'NHIS Clinic',
    timeSlot: '09:30 AM',
    date: new Date().toISOString().split('T')[0],
    isEmergency: true,
    timestamp: Date.now() - 1800000,
    paymentStatus: 'Paid',
    assignedStaffId: undefined
  }
];
