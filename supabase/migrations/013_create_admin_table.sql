-- Migration: Admin System Support
-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view themselves') THEN
        CREATE POLICY "Admins can view themselves" ON public.admins FOR SELECT USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update themselves') THEN
        CREATE POLICY "Admins can update themselves" ON public.admins FOR UPDATE USING (auth.uid() = id);
    END IF;
END $$;

-- Update handle_new_user to handle admin role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get role from metadata
  user_role := new.raw_user_meta_data->>'role';

  -- If user is admin (specifically from the admin signup flow), insert into public.admins
  IF user_role = 'admin' THEN
    INSERT INTO public.admins (
      id,
      email,
      full_name,
      phone
    )
    VALUES (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
  END IF;

  -- If user is staff/hospital_admin (legacy/internal), DO NOT insert into public.users
  IF user_role IN ('hospital_admin', 'staff', 'doctor', 'nurse', 'pharmacist', 'receptionist') THEN
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
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_hospital to also update public.admins
CREATE OR REPLACE FUNCTION public.handle_new_hospital()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the admin record with the new hospital_id
  UPDATE public.admins
  SET hospital_id = new.id
  WHERE id = auth.uid();

  -- Maintain legacy staff record for simplicity/compatibility for now
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
  WHERE new_user.id = auth.uid()
  ON CONFLICT (id) DO UPDATE SET hospital_id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
