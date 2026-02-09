-- Enhanced Seed Data for Health Queue
-- Description: Comprehensive hospital data for testing and production
-- Created: 2026-02-09

-- ============================================
-- CLEAR EXISTING HOSPITALS (for fresh seeding)
-- ============================================
-- Uncomment the line below if you want to reset hospitals
-- DELETE FROM public.hospitals;

-- ============================================
-- SEED HOSPITALS
-- ============================================
INSERT INTO public.hospitals (id, name, location, address, phone, email, latitude, longitude, departments, services, is_open, registration_fee, operating_hours)
VALUES 
-- Hospital 1: General Hospital Lagos
(
  'a1b2c3d4-e5f6-7890-ab12-cd34ef567890',
  'General Hospital Lagos',
  'Victoria Island, Lagos',
  '123 Medical Drive, Victoria Island, Lagos State',
  '+234-801-234-5678',
  'info@generalhospitallagos.ng',
  6.4281,
  3.4219,
  '["Emergency", "OPD", "Pediatrics", "Obstetrics", "Surgery", "Laboratory", "Pharmacy"]'::jsonb,
  '{
    "Emergency": ["Trauma Care", "Urgent Care", "Emergency Surgery"],
    "OPD": ["General Consultation", "Chronic Disease Management", "Health Screening"],
    "Pediatrics": ["Child Health Check", "Vaccination", "Pediatric Consultation"],
    "Obstetrics": ["Antenatal Care", "Delivery", "Postnatal Care"],
    "Surgery": ["Minor Surgery", "Major Surgery", "Pre-op Consultation"],
    "Laboratory": ["Blood Test", "Urine Analysis", "Full Blood Count"],
    "Pharmacy": ["Drug Dispensing", "Prescription Filling", "Medication Counseling"]
  }'::jsonb,
  true,
  3500.00,
  '{
    "monday": {"open": "06:00", "close": "22:00"},
    "tuesday": {"open": "06:00", "close": "22:00"},
    "wednesday": {"open": "06:00", "close": "22:00"},
    "thursday": {"open": "06:00", "close": "22:00"},
    "friday": {"open": "06:00", "close": "22:00"},
    "saturday": {"open": "08:00", "close": "20:00"},
    "sunday": {"open": "08:00", "close": "18:00"}
  }'::jsonb
),

-- Hospital 2: University Teaching Hospital Ibadan
(
  'b2c3d4e5-f6a7-8901-bc23-de45ef678901',
  'University Teaching Hospital Ibadan',
  'Ibadan, Oyo State',
  '1 University Road, Ibadan, Oyo State',
  '+234-802-345-6789',
  'contact@uthib.edu.ng',
  7.3775,
  3.9470,
  '["Emergency", "Cardiology", "Neurology", "Oncology", "Orthopedics", "OPD", "Laboratory", "Pharmacy"]'::jsonb,
  '{
    "Emergency": ["24/7 Emergency Care", "Ambulance Service", "Critical Care"],
    "Cardiology": ["Heart Screening", "ECG", "Cardiac Consultation", "Stress Test"],
    "Neurology": ["Neurological Examination", "Brain Scan", "Pain Management"],
    "Oncology": ["Cancer Screening", "Chemotherapy", "Oncology Consultation"],
    "Orthopedics": ["Bone X-Ray", "Fracture Treatment", "Joint Care", "Physiotherapy"],
    "OPD": ["General Consultation", "Follow-up Visits", "Health Screening"],
    "Laboratory": ["Blood Test", "Pathology", "Microbiology"],
    "Pharmacy": ["Drug Dispensing", "Prescription Services"]
  }'::jsonb,
  true,
  5000.00,
  '{
    "monday": {"open": "00:00", "close": "23:59"},
    "tuesday": {"open": "00:00", "close": "23:59"},
    "wednesday": {"open": "00:00", "close": "23:59"},
    "thursday": {"open": "00:00", "close": "23:59"},
    "friday": {"open": "00:00", "close": "23:59"},
    "saturday": {"open": "00:00", "close": "23:59"},
    "sunday": {"open": "00:00", "close": "23:59"}
  }'::jsonb
),

-- Hospital 3: Abuja National Hospital
(
  'c3d4e5f6-a7b8-9012-cd34-ef56ab789012',
  'Abuja National Hospital',
  'Central Area, Abuja',
  '2 Hospital Boulevard, Central Area, FCT Abuja',
  '+234-803-456-7890',
  'info@abujahospital.gov.ng',
  9.0579,
  7.4951,
  '["Emergency", "OPD", "Dermatology", "ENT", "Radiology", "Laboratory", "Pharmacy"]'::jsonb,
  '{
    "Emergency": ["Emergency Room", "Trauma Unit", "ICU"],
    "OPD": ["General Consultation", "Diabetes Care", "Hypertension Management"],
    "Dermatology": ["Skin Consultation", "Allergy Testing", "Dermatology Procedures"],
    "ENT": ["Ear Examination", "Throat Treatment", "Hearing Test"],
    "Radiology": ["X-Ray", "CT Scan", "MRI", "Ultrasound"],
    "Laboratory": ["Blood Test", "Full Medical Check-up"],
    "Pharmacy": ["Drug Dispensing", "Medication Advice"]
  }'::jsonb,
  true,
  4000.00,
  '{
    "monday": {"open": "06:00", "close": "22:00"},
    "tuesday": {"open": "06:00", "close": "22:00"},
    "wednesday": {"open": "06:00", "close": "22:00"},
    "thursday": {"open": "06:00", "close": "22:00"},
    "friday": {"open": "06:00", "close": "22:00"},
    "saturday": {"open": "08:00", "close": "20:00"},
    "sunday": {"open": "10:00", "close": "18:00"}
  }'::jsonb
),

-- Hospital 4: St. Nicholas Hospital Lekki
(
  'd4e5f6a7-b8c9-0123-de45-fa67bc890123',
  'St. Nicholas Hospital',
  'Lekki, Lagos',
  '57 Campbell Street, Lekki Phase 1, Lagos',
  '+234-804-567-8901',
  'info@stnicholas.com.ng',
  6.4474,
  3.4739,
  '["OPD", "Pediatrics", "Obstetrics", "Dental", "Laboratory", "Pharmacy"]'::jsonb,
  '{
    "OPD": ["General Consultation", "Health Screening", "Medical Check-up"],
    "Pediatrics": ["Child Healthcare", "Vaccination Program", "Growth Monitoring"],
    "Obstetrics": ["Antenatal Services", "Delivery Package", "Postnatal Care"],
    "Dental": ["Dental Check-up", "Cleaning", "Extraction", "Filling"],
    "Laboratory": ["Blood Test", "Pregnancy Test", "Typhoid Test"],
    "Pharmacy": ["Drug Dispensing", "OTC Medications"]
  }'::jsonb,
  true,
  3000.00,
  '{
    "monday": {"open": "07:00", "close": "21:00"},
    "tuesday": {"open": "07:00", "close": "21:00"},
    "wednesday": {"open": "07:00", "close": "21:00"},
    "thursday": {"open": "07:00", "close": "21:00"},
    "friday": {"open": "07:00", "close": "21:00"},
    "saturday": {"open": "08:00", "close": "18:00"},
    "sunday": {"open": "09:00", "close": "16:00"}
  }'::jsonb
),

-- Hospital 5: Cedarcrest Hospitals Abuja
(
  'e5f6a7b8-c9d0-1234-ef56-ab78cd901234',
  'Cedarcrest Hospitals',
  'Gudu, Abuja',
  '6 Nnamdi Azikiwe Street, Gudu District, Abuja',
  '+234-805-678-9012',
  'reception@cedarcrest.com.ng',
  9.0467,
  7.4324,
  '["OPD", "ENT", "Ophthalmology", "Dental", "Laboratory", "Pharmacy"]'::jsonb,
  '{
    "OPD": ["General Practice", "Medical Consultation", "Wellness Check"],
    "ENT": ["Ear Treatment", "Nose Care", "Throat Examination"],
    "Ophthalmology": ["Eye Exam", "Vision Test", "Glasses Prescription"],
    "Dental": ["Dental Care", "Oral Hygiene", "Cosmetic Dentistry"],
    "Laboratory": ["Blood Work", "Diagnostic Tests"],
    "Pharmacy": ["Prescription Drugs", "Health Products"]
  }'::jsonb,
  true,
  2500.00,
  '{
    "monday": {"open": "08:00", "close": "20:00"},
    "tuesday": {"open": "08:00", "close": "20:00"},
    "wednesday": {"open": "08:00", "close": "20:00"},
    "thursday": {"open": "08:00", "close": "20:00"},
    "friday": {"open": "08:00", "close": "20:00"},
    "saturday": {"open": "09:00", "close": "17:00"},
    "sunday": {"open": "10:00", "close": "15:00"}
  }'::jsonb
),

-- Hospital 6: Lagoon Hospitals Ikeja
(
  'f6a7b8c9-d0e1-2345-af67-bc89de012345',
  'Lagoon Hospitals',
  'Ikeja, Lagos',
  '12 Acme Road, Ogba, Ikeja, Lagos',
  '+234-806-789-0123',
  'info@lagoonhospitals.ng',
  6.6188,
  3.3378,
  '["Emergency", "OPD", "Surgery", "Radiology", "Laboratory", "Pharmacy"]'::jsonb,
  '{
    "Emergency": ["Emergency Services", "Accident & Trauma"],
    "OPD": ["General Medicine", "Specialist Consultation"],
    "Surgery": ["General Surgery", "Laparoscopic Surgery"],
    "Radiology": ["X-Ray", "Ultrasound", "CT Scan"],
    "Laboratory": ["Clinical Tests", "Diagnostics"],
    "Pharmacy": ["Medications", "Medical Supplies"]
  }'::jsonb,
  true,
  4500.00,
  '{
    "monday": {"open": "00:00", "close": "23:59"},
    "tuesday": {"open": "00:00", "close": "23:59"},
    "wednesday": {"open": "00:00", "close": "23:59"},
    "thursday": {"open": "00:00", "close": "23:59"},
    "friday": {"open": "00:00", "close": "23:59"},
    "saturday": {"open": "00:00", "close": "23:59"},
    "sunday": {"open": "00:00", "close": "23:59"}
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  departments = EXCLUDED.departments,
  services = EXCLUDED.services,
  is_open = EXCLUDED.is_open,
  registration_fee = EXCLUDED.registration_fee,
  operating_hours = EXCLUDED.operating_hours,
  updated_at = NOW();

-- Verify insertion
SELECT COUNT(*) as total_hospitals FROM public.hospitals;
