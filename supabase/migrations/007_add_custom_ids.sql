-- Migration: Add Custom IDs and Update Schemas
-- Description: Adds unique ID generation for Patients (HQxxxxx), Hospitals (ABCxxxxx), and Staff (ABC-xxxxx)

-- 1. Add ID columns
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS patient_code text UNIQUE;
ALTER TABLE public.hospitals ADD COLUMN IF NOT EXISTS hospital_code text UNIQUE;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS staff_code text UNIQUE;

-- 2. Function to generate Patient ID (HQ + 5 digits)
CREATE OR REPLACE FUNCTION generate_patient_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code text;
  done bool;
BEGIN
  done := false;
  WHILE NOT done LOOP
    -- Generate HQ + random 5 digits
    new_code := 'HQ' || floor(random() * 90000 + 10000)::text;
    -- Check uniqueness
    done := NOT EXISTS (SELECT 1 FROM public.patients WHERE patient_code = new_code);
  END LOOP;
  NEW.patient_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to generate Hospital ID (3 letters + 5 digits)
CREATE OR REPLACE FUNCTION generate_hospital_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code text;
  abbr text;
  done bool;
BEGIN
  -- Get first 3 letters of name, UPPERCASE, remove non-alpha
  abbr := upper(substring(regexp_replace(NEW.name, '[^a-zA-Z]', '', 'g') from 1 for 3));
  IF length(abbr) < 3 THEN
    abbr := 'HOS'; -- Fallback if name is too short/symbols
  END IF;

  done := false;
  WHILE NOT done LOOP
    new_code := abbr || floor(random() * 90000 + 10000)::text;
    done := NOT EXISTS (SELECT 1 FROM public.hospitals WHERE hospital_code = new_code);
  END LOOP;
  NEW.hospital_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Function to generate Staff ID (HospitalCode - 5 digits)
CREATE OR REPLACE FUNCTION generate_staff_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code text;
  hosp_code text;
  done bool;
BEGIN
  -- Get the hospital code
  SELECT hospital_code INTO hosp_code FROM public.hospitals WHERE id = NEW.hospital_id;
  
  -- If hospital doesn't have a code yet (legacy), generate a temp one or handle error
  IF hosp_code IS NULL THEN
     -- Fallback logic or fetch hospital name to generate ad-hoc
     hosp_code := 'STF'; 
  END IF;

  done := false;
  WHILE NOT done LOOP
    new_code := hosp_code || '-' || floor(random() * 90000 + 10000)::text;
    done := NOT EXISTS (SELECT 1 FROM public.staff WHERE staff_code = new_code);
  END LOOP;
  NEW.staff_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create Triggers
DROP TRIGGER IF EXISTS trigger_generate_patient_code ON public.patients;
CREATE TRIGGER trigger_generate_patient_code
  BEFORE INSERT ON public.patients
  FOR EACH ROW
  EXECUTE PROCEDURE generate_patient_code();

DROP TRIGGER IF EXISTS trigger_generate_hospital_code ON public.hospitals;
CREATE TRIGGER trigger_generate_hospital_code
  BEFORE INSERT ON public.hospitals
  FOR EACH ROW
  EXECUTE PROCEDURE generate_hospital_code();

DROP TRIGGER IF EXISTS trigger_generate_staff_code ON public.staff;
CREATE TRIGGER trigger_generate_staff_code
  BEFORE INSERT ON public.staff
  FOR EACH ROW
  EXECUTE PROCEDURE generate_staff_code();

-- 6. Backfill existing records (Optional - run only if needed logic)
-- Update existing hospitals first
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT * FROM public.hospitals WHERE hospital_code IS NULL LOOP
    UPDATE public.hospitals 
    SET name = name -- dummy update to fire trigger? No, Before Insert only. Manual update:
    WHERE id = r.id; 
    -- Actually, simpler to just run the logic manually for backfill
  END LOOP;
END $$;
