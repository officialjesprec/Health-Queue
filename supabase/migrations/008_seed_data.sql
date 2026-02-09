-- Migration: Seed Data (Updated)
-- Description: Seeding comprehensive hospital data for the 6 samples.
-- Created: 2026-02-09

-- 1. Truncate tables to clear data (Order matters due to foreign keys)
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.feedback CASCADE;
TRUNCATE TABLE public.payments CASCADE;
TRUNCATE TABLE public.queue_items CASCADE;
TRUNCATE TABLE public.hospital_profiles CASCADE;
TRUNCATE TABLE public.staff CASCADE;
TRUNCATE TABLE public.hospitals CASCADE;

-- 2. Insert the 6 Dummy Hospitals
INSERT INTO public.hospitals (id, name, location, address, phone, email, departments, services, is_open, registration_fee)
VALUES 
(
  'a1b2c3d4-e5f6-7890-ab12-cd34ef567890',
  'General Hospital Lagos',
  'Victoria Island, Lagos',
  '123 Medical Drive, Victoria Island, Lagos State',
  '+234-801-234-5678',
  'info@generalhospitallagos.ng',
  '["Emergency", "OPD", "Pediatrics", "Obstetrics", "Surgery", "Laboratory", "Pharmacy"]'::jsonb,
  '{"Emergency": ["Trauma Care", "Urgent Care"], "OPD": ["General Consultation"], "Laboratory": ["Blood Test"]}'::jsonb,
  true,
  3500.00
),
(
  'b2c3d4e5-f6a7-8901-bc23-de45ef678901',
  'University Teaching Hospital Ibadan',
  'Ibadan, Oyo State',
  '1 University Road, Ibadan, Oyo State',
  '+234-802-345-6789',
  'contact@uthib.edu.ng',
  '["Emergency", "Cardiology", "Neurology", "OPD", "Laboratory"]'::jsonb,
  '{"Emergency": ["24/7 Support"], "Cardiology": ["ECG"], "OPD": ["Consultation"]}'::jsonb,
  true,
  5000.00
),
(
  'c3d4e5f6-a7b8-9012-cd34-ef56ab789012',
  'Abuja National Hospital',
  'Central Area, Abuja',
  '2 Hospital Boulevard, Central Area, FCT Abuja',
  '+234-803-456-7890',
  'info@abujahospital.gov.ng',
  '["Emergency", "OPD", "Dermatology", "ENT", "Radiology"]'::jsonb,
  '{"OPD": ["Diabetes Care"], "Radiology": ["X-Ray", "CT Scan"]}'::jsonb,
  true,
  4000.00
),
(
  'd4e5f6a7-b8c9-0123-de45-fa67bc890123',
  'St. Nicholas Hospital',
  'Lekki, Lagos',
  '57 Campbell Street, Lekki Phase 1, Lagos',
  '+234-804-567-8901',
  'info@stnicholas.com.ng',
  '["OPD", "Pediatrics", "Obstetrics", "Dental", "Laboratory"]'::jsonb,
  '{"OPD": ["Health Screening"], "Dental": ["Cleaning", "Extraction"]}'::jsonb,
  true,
  3000.00
),
(
  'e5f6a7b8-c9d0-1234-ef56-ab78cd901234',
  'Cedarcrest Hospitals',
  'Gudu, Abuja',
  '6 Nnamdi Azikiwe Street, Gudu District, Abuja',
  '+234-805-678-9012',
  'reception@cedarcrest.com.ng',
  '["OPD", "ENT", "Ophthalmology", "Dental", "Laboratory"]'::jsonb,
  '{"OPD": ["General Practice"], "ENT": ["Ear Treatment"]}'::jsonb,
  true,
  2500.00
),
(
  'f6a7b8c9-d0e1-2345-af67-bc89de012345',
  'Lagoon Hospitals',
  'Ikeja, Lagos',
  '12 Acme Road, Ogba, Ikeja, Lagos',
  '+234-806-789-0123',
  'info@lagoonhospitals.ng',
  '["Emergency", "OPD", "Surgery", "Radiology", "Laboratory"]'::jsonb,
  '{"Emergency": ["Accident & Trauma"], "Surgery": ["General Surgery"]}'::jsonb,
  true,
  4500.00
);
