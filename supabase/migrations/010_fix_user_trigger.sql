-- Migration: Fix Handle New User Trigger
-- Description: Modify handle_new_user to skip creating public.users record for staff/admins
-- This ensures staff are only in public.staff and patients are in public.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from metadata
  user_role := new.raw_user_meta_data->>'role';

  -- If user is staff/admin, DO NOT insert into public.users
  IF user_role IN ('hospital_admin', 'admin', 'staff', 'doctor', 'nurse', 'pharmacist', 'receptionist') THEN
    RETURN new;
  END IF;

  -- Default behavior: Insert into public.users (for patients)
  INSERT INTO public.users (
    id,
    email,
    full_name,
    phone,
    date_of_birth,
    gender
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    (new.raw_user_meta_data->>'date_of_birth')::date,
    new.raw_user_meta_data->>'gender'
  )
  ON CONFLICT (id) DO NOTHING; -- Gracefully handle duplicates

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail auth signup
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
