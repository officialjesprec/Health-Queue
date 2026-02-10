-- Create user_profiles table if it doesn't exist to store medical cards
CREATE TABLE IF NOT EXISTS public.hospital_profiles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    hospital_id uuid REFERENCES public.hospitals(id) NOT NULL,
    card_id text NOT NULL,
    registration_date bigint, -- Storing as timestamp number for now to match frontend, or logic
    is_paid boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, hospital_id)
);

-- Enable RLS
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profiles"
ON public.hospital_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles"
ON public.hospital_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Staff can view profiles for their hospital
CREATE POLICY "Staff can view profiles for their hospital"
ON public.hospital_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.staff
    WHERE staff.id = auth.uid()
    AND staff.hospital_id = hospital_profiles.hospital_id
  )
);
