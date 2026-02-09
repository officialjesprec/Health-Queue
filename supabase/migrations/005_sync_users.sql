-- Migration: Sync Missing Users
-- Description: Backfill public.users for any auth.users that are missing profiles
-- Created: 2026-02-07

DO $$
DECLARE
  missing_user RECORD;
BEGIN
  FOR missing_user IN
    SELECT * FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.users)
  LOOP
    INSERT INTO public.users (
      id,
      email,
      full_name,
      phone,
      date_of_birth,
      gender
    )
    VALUES (
      missing_user.id,
      missing_user.email,
      COALESCE(missing_user.raw_user_meta_data->>'full_name', 'Unknown User'),
      COALESCE(missing_user.raw_user_meta_data->>'phone', 'No Phone'),
      (missing_user.raw_user_meta_data->>'date_of_birth')::date,
      missing_user.raw_user_meta_data->>'gender'
    );
  END LOOP;
END;
$$;
