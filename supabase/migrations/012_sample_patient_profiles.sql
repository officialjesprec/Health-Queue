-- Migration: Sample Patient Profiles
-- Description: Automatically links the most recent user to all 6 dummy hospitals.
-- Created: 2026-02-09

DO $$
DECLARE
    target_user_id UUID;
    hospital_record RECORD;
BEGIN
    -- 1. Find the latest registered user
    SELECT id INTO target_user_id FROM public.users ORDER BY created_at DESC LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        -- 2. Loop through the 6 dummy hospitals and create profiles
        FOR hospital_record IN 
            SELECT id FROM public.hospitals 
            WHERE id IN (
                'a1b2c3d4-e5f6-7890-ab12-cd34ef567890',
                'b2c3d4e5-f6a7-8901-bc23-de45ef678901',
                'c3d4e5f6-a7b8-9012-cd34-ef56ab789012',
                'd4e5f6a7-b8c9-0123-de45-fa67bc890123',
                'e5f6a7b8-c9d0-1234-ef56-ab78cd901234',
                'f6a7b8c9-d0e1-2345-af67-bc89de012345'
            )
        LOOP
            INSERT INTO public.hospital_profiles (user_id, hospital_id, card_id, is_paid)
            VALUES (
                target_user_id, 
                hospital_record.id, 
                'MED-' || floor(random() * (999999-100000+1) + 100000)::text,
                true
            )
            ON CONFLICT (user_id, hospital_id) DO NOTHING;
        END LOOP;
    END IF;
END $$;
