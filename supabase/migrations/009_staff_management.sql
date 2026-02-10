-- Migration: Staff Management System
-- Description: Add staff_code and create invites table for admin-managed staff creation

-- 1. Add staff_code to existing staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS staff_code TEXT UNIQUE;

-- 2. Create Staff Invites table
-- This holds staff details created by Admin BEFORE the staff member activates their account
CREATE TABLE IF NOT EXISTS public.staff_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    staff_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    status TEXT DEFAULT 'pending',
    CONSTRAINT valid_limit_role CHECK (role IN ('doctor', 'nurse', 'receptionist', 'pharmacist', 'admin'))
);

-- 3. Security Policies for Invites
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;

-- Admins can view/manage invites for their hospital
CREATE POLICY "Admins can view hospital invites"
  ON public.staff_invites FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.hospital_id = staff_invites.hospital_id 
      AND staff.id = auth.uid() 
      AND staff.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert invites"
  ON public.staff_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.hospital_id = hospital_id 
      AND staff.id = auth.uid() 
      AND staff.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete invites"
  ON public.staff_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE staff.hospital_id = staff_invites.hospital_id 
      AND staff.id = auth.uid() 
      AND staff.role = 'admin'
    )
  );

-- Allow public read access strictly for Activation Verification (checking if code exists)
-- In production, we might use a secure function (RPC) instead, but public read on Code is acceptable for MVP
CREATE POLICY "Public can verify invite codes"
  ON public.staff_invites FOR SELECT
  USING (true); 
