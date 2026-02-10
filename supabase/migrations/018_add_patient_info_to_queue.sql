-- Migration: Add missing columns to queue_items
-- Description: Adds patient_name and phone to queue_items for better flexibility and guest bookings.
-- Created: 2026-02-10

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'queue_items' AND column_name = 'patient_name') THEN
        ALTER TABLE public.queue_items ADD COLUMN patient_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'queue_items' AND column_name = 'phone') THEN
        ALTER TABLE public.queue_items ADD COLUMN phone TEXT;
    END IF;

    -- Make patient_id nullable to support guest/walk-in bookings
    ALTER TABLE public.queue_items ALTER COLUMN patient_id DROP NOT NULL;
END $$;
