-- Seed Data for Health Queue
-- Description: Initial data for testing and development
-- Created: 2026-02-07

-- ============================================
-- SEED HOSPITALS
-- ============================================
INSERT INTO public.hospitals (id, name, location, address, phone, email, latitude, longitude, departments, services, is_open, registration_fee, operating_hours)
VALUES 
(
  'a1b2c3d4-e5f6-7890-ab12-cd34ef567890',
  'General Hospital Lagos',
  'Lagos',
  '123 Medical Drive, Victoria Island, Lagos',
  '+234-801-234-5678',
  'info@generalhospitallagos.ng',
  6.4281,
  3.4219,
  '["Emergency", "General Medicine", "Pediatrics", "Obstetrics", "Surgery"]'::jsonb,
  '{
    "Emergency": ["Trauma Care", "Urgent Care", "Emergency Surgery"],
    "General Medicine": ["Consultation", "Chronic Disease Management", "Health Screening"],
    "Pediatrics": ["Child Health Check", "Vaccination", "Pediatric Consultation"],
    "Obstetrics": ["Antenatal Care", "Delivery", "Postnatal Care"],
    "Surgery": ["Minor Surgery", "Major Surgery", "Pre-op Consultation"]
  }'::jsonb,
  true,
  5000.00,
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
(
  'b2c3d4e5-f6a7-8901-bc23-de45ef678901',
  'University Teaching Hospital Ibadan',
  'Ibadan',
  '1 University Road, Ibadan, Oyo State',
  '+234-802-345-6789',
  'contact@uthib.edu.ng',
  7.3775,
  3.9470,
  '["Emergency", "Cardiology", "Neurology", "Oncology", "Orthopedics"]'::jsonb,
  '{
    "Emergency": ["24/7 Emergency Care", "Ambulance Service"],
    "Cardiology": ["Heart Screening", "ECG", "Cardiac Consultation"],
    "Neurology": ["Neurological Examination", "Brain Scan", "Pain Management"],
    "Oncology": ["Cancer Screening", "Chemotherapy", "Oncology Consultation"],
    "Orthopedics": ["Bone X-Ray", "Fracture Treatment", "Joint Care"]
  }'::jsonb,
  true,
  7500.00,
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
(
  'c3d4e5f6-a7b8-9012-cd34-ef56ab789012',
  'Abuja National Hospital',
  'Abuja',
  '2 Hospital Boulevard, Central Area, Abuja',
  '+234-803-456-7890',
  'info@abujahospital.gov.ng',
  9.0579,
  7.4951,
  '["Emergency", "Internal Medicine", "Dermatology", "ENT", "Radiology"]'::jsonb,
  '{
    "Emergency": ["Emergency Room", "Trauma Unit", "ICU"],
    "Internal Medicine": ["General Consultation", "Diabetes Care", "Hypertension Management"],
    "Dermatology": ["Skin Consultation", "Allergy Testing", "Dermatology Procedures"],
    "ENT": ["Ear Examination", "Throat Treatment", "Hearing Test"],
    "Radiology": ["X-Ray", "CT Scan", "MRI", "Ultrasound"]
  }'::jsonb,
  true,
  6000.00,
  '{
    "monday": {"open": "06:00", "close": "22:00"},
    "tuesday": {"open": "06:00", "close": "22:00"},
    "wednesday": {"open": "06:00", "close": "22:00"},
    "thursday": {"open": "06:00", "close": "22:00"},
    "friday": {"open": "06:00", "close": "22:00"},
    "saturday": {"open": "08:00", "close": "20:00"},
    "sunday": {"open": "10:00", "close": "18:00"}
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Note: User data and staff data should be created through the authentication system
-- The above seed data is sufficient for initial testing
