-- Migration: Fix staff table column reference in handle_new_hospital function
-- This fixes the error: column "name" of relation "staff" does not exist
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_hospital()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the creator as an admin staff member
  -- Fixed: changed 'name' to 'full_name' to match staff table schema
  INSERT INTO public.staff (
    id,
    hospital_id,
    role,
    full_name,
    email
  )
  SELECT
    auth.uid(),
    NEW.id,
    'admin',
    new_user.raw_user_meta_data->>'full_name',
    new_user.email
  FROM auth.users AS new_user
  WHERE new_user.id = auth.uid();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
