-- Migration: Seed Data
-- Description: Clear existing data and seed sample hospitals.

-- 1. Truncate tables to clear data (Order matters due to foreign keys)
-- We use CASCADE to clean up dependent rows
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.feedback CASCADE;
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.queue_items CASCADE;
TRUNCATE TABLE public.hospital_profiles CASCADE;
TRUNCATE TABLE public.staff CASCADE;
TRUNCATE TABLE public.hospitals CASCADE; -- This cascades to slots/etc if they existed, but definitely to staff.hospital_id

-- 2. Insert Sample Hospitals with UUIDs matching constants.ts
INSERT INTO public.hospitals (id, name, location, departments, services, is_open, registration_fee)
VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Lagos University Teaching Hospital (LUTH)',
  'Idi-Araba, Lagos',
  '["OPD", "Dental", "Antenatal", "Lab", "Radiotherapy"]'::jsonb,
  '{"OPD": ["General Consultation", "Immunization", "Family Medicine", "NHIS Clinic"], "Dental": ["Tooth Extraction", "Root Canal", "Scaling & Polishing", "Orthodontics"], "Antenatal": ["Pregnancy Checkup", "Postnatal Care", "Ultrasound Scan"], "Lab": ["Blood Test", "Urinalysis", "Biopsy", "HIV Screening"], "Radiotherapy": ["Cancer Treatment", "CT Simulation", "Brachytherapy"]}'::jsonb,
  true,
  2500
),
(
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  'Ilorin General Hospital',
  'Ilorin, Kwara State',
  '["OPD", "Pediatrics", "Pharmacy", "Surgery"]'::jsonb,
  '{"OPD": ["General Checkup", "Malaria Treatment", "Blood Pressure Check"], "Pediatrics": ["Child Welfare", "Vaccination", "Pediatric Surgery"], "Pharmacy": ["Drug Refill", "Medication Counseling"], "Surgery": ["Minor Surgery", "Orthopedic Consultation", "Wound Dressing"]}'::jsonb,
  true,
  1500
),
(
  'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  'Reddington Hospital',
  'Victoria Island, Lagos',
  '["OPD", "Cardiology", "Emergency", "Diagnostics"]'::jsonb,
  '{"OPD": ["Executive Wellness Check", "Specialist Consultation"], "Cardiology": ["ECG/EKG", "Echo Cardiogram", "Stress Test", "Heart Surgery"], "Emergency": ["Trauma Care", "Ambulance Service", "Acute Care"], "Diagnostics": ["MRI Scan", "CT Scan", "Endoscopy", "Mammography"]}'::jsonb,
  true,
  5000
);

-- Note: We have NOT identified specific users for Staff roles yet. 
-- Any user who signs up can be manually promoted to staff for these hospitals 
-- by inserting into the 'staff' table with the corresponding hospital_id.
