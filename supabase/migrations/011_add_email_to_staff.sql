-- Migration 011: Add email to staff table
-- Description: Store email in public.staff to allow looking up login email via Staff ID

ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);
