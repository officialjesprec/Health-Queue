-- Migration: Fix Staff Recursion and Ensure Schema
    -- Description: Relaxes the RLS policies on the 'staff' table to prevent infinite recursion, and ensures 'staff_code' column exists.

    -- 1. Ensure staff_code column exists (Idempotent)
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'staff_code') THEN
            ALTER TABLE public.staff ADD COLUMN staff_code TEXT UNIQUE;
        END IF;
    END $$;

    -- 2. Create a SECURITY DEFINER function to check admin role without triggering RLS
    -- This function runs with the privileges of the creator (postgres/superuser), bypassing RLS
    CREATE OR REPLACE FUNCTION public.check_is_admin_safe(user_id uuid)
    RETURNS BOOLEAN AS $$
    DECLARE
        user_role text;
    BEGIN
        SELECT role INTO user_role FROM public.staff WHERE id = user_id;
        RETURN user_role IN ('admin', 'hospital_admin');
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 3. Drop existing recursive policies
    DROP POLICY IF EXISTS "Staff can view their own profile" ON public.staff;
    DROP POLICY IF EXISTS "Admins can view all staff" ON public.staff;
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff;
    DROP POLICY IF EXISTS "Admins can insert staff" ON public.staff;
    DROP POLICY IF EXISTS "Admins can update staff" ON public.staff;
    DROP POLICY IF EXISTS "Admins can delete staff" ON public.staff;

    -- 4. Create new optimized policies
    -- Policy 1: Users can view THEIR OWN profile (Simple ID match, no recursion)
    CREATE POLICY "Staff view own" ON public.staff
    FOR SELECT USING (auth.uid() = id);

    -- Policy 2: Admins can view ALL staff (Uses SAFE function to avoid recursion)
    CREATE POLICY "Admins view all" ON public.staff
    FOR SELECT USING (check_is_admin_safe(auth.uid()));

    -- Policy 3: Admins can manage (Insert/Update/Delete) staff
    CREATE POLICY "Admins insert" ON public.staff
    FOR INSERT WITH CHECK (check_is_admin_safe(auth.uid()));

    CREATE POLICY "Admins update" ON public.staff
    FOR UPDATE USING (check_is_admin_safe(auth.uid()));

    CREATE POLICY "Admins delete" ON public.staff
    FOR DELETE USING (check_is_admin_safe(auth.uid()));

    -- 5. Grant execute permission on the safe function
    GRANT EXECUTE ON FUNCTION public.check_is_admin_safe TO authenticated;
    GRANT EXECUTE ON FUNCTION public.check_is_admin_safe TO service_role;
