-- Migration: Enable Hospital Registration
-- Description: Allow users to register hospitals and automatically become admins
-- Created: 2026-02-07

-- 1. Update RLS for Hospitals to allow authenticated INSERT
DROP POLICY IF EXISTS "Only admins can insert hospitals" ON public.hospitals;
CREATE POLICY "Authenticated users can create hospitals"
  ON public.hospitals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 2. Function to auto-create staff record for new hospital creator
CREATE OR REPLACE FUNCTION public.handle_new_hospital()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the creator as an admin staff member
  INSERT INTO public.staff (
    id,
    hospital_id,
    role,
    full_name,
    email
  )
  SELECT
    auth.uid(),
    new.id,
    'admin',
    new_user.raw_user_meta_data->>'full_name',
    new_user.email
  FROM auth.users AS new_user
  WHERE new_user.id = auth.uid();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger for new hospital creation
DROP TRIGGER IF EXISTS on_hospital_created ON public.hospitals;
CREATE TRIGGER on_hospital_created
  AFTER INSERT ON public.hospitals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_hospital();

-- 4. Enable RLS for Staff (if not already) and ensure they can view themselves
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view themselves" ON public.staff;
CREATE POLICY "Staff can view themselves"
  ON public.staff FOR SELECT
  USING (auth.uid() = id);

-- 5. Helper function to check if user is admin of a hospital
CREATE OR REPLACE FUNCTION public.is_hospital_admin(hospital_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.hospital_id = $1
    AND staff.id = auth.uid()
    AND staff.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
