-- Migration: Add User Trigger
-- Description: Create a trigger to automatically sync auth.users with public.users.

-- 1. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Backfill existing users if any (Optional)
-- This version filters out any users whose ID or Phone already exists in public.users
-- and uses DISTINCT ON (phone) to handle duplicates within auth.users itself.
INSERT INTO public.users (id, email, full_name, phone)
SELECT DISTINCT ON (au.raw_user_meta_data->>'phone')
    au.id, 
    au.email, 
    au.raw_user_meta_data->>'full_name', 
    au.raw_user_meta_data->>'phone'
FROM auth.users au
WHERE au.raw_user_meta_data->>'phone' IS NOT NULL
  AND au.id NOT IN (SELECT id FROM public.users)
  AND (au.raw_user_meta_data->>'phone') NOT IN (SELECT phone FROM public.users)
ORDER BY au.raw_user_meta_data->>'phone', au.created_at DESC
ON CONFLICT (id) DO NOTHING;
