# How to Reset the Database and Seed Sample Data

The `constants.ts` file has been updated with valid UUIDs for the sample hospitals to match the database requirements.
A new SQL migration file `supabase/migrations/008_seed_data.sql` has been created to clear the database and insert these hospitals.

**To complete the reset, follow these steps:**

1.  Open your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Go to the **SQL Editor**.
3.  Click **New Query**.
4.  Copy and paste the entire content of `supabase/migrations/008_seed_data.sql`.
5.  Click **Run**.
    *   This will clear all bookings, staff, and patients (except authentication accounts).
    *   It will insert the 3 sample hospitals (LUTH, Ilorin General, Reddington) with the correct IDs.

### How to Create Test Staff

Since authentication accounts cannot be created via SQL script (for security reasons), you must manually create staff accounts:

1.  Go to your app's **Hospital Signup** page (`/hospital/signup`).
2.  Sign up a new account (e.g., `admin@luth.com`, password `password123`).
3.  After signing up, you will be redirected to the "Register Hospital" page. **Ignore this.**
4.  Instead, go back to the Supabase SQL Editor and run the following command to link your new user to LUTH:

```sql
-- Replace 'YOUR_USER_EMAIL' with the email you just signed up with
-- Replace 'HOSPITAL_NAME_PART' with 'LUTH', 'Ilorin', or 'Reddington'

DO $$
DECLARE
    target_user_id UUID;
    target_hospital_id UUID;
BEGIN
    -- 1. Find the User ID
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'admin@luth.com'; -- CHANGE EMAIL HERE

    -- 2. Find the Hospital ID
    SELECT id INTO target_hospital_id FROM public.hospitals WHERE name LIKE '%LUTH%'; -- CHANGE HOSPITAL HERE

    -- 3. Insert into Staff
    IF target_user_id IS NOT NULL AND target_hospital_id IS NOT NULL THEN
        INSERT INTO public.staff (id, hospital_id, full_name, role, email)
        VALUES (
            target_user_id, 
            target_hospital_id, 
            'Admin Staff', 
            'admin', 
            'admin@luth.com' -- CHANGE EMAIL HERE
        )
        ON CONFLICT (id) DO UPDATE SET hospital_id = EXCLUDED.hospital_id;
        
        RAISE NOTICE 'Staff created successfully!';
    ELSE
        RAISE NOTICE 'User or Hospital not found.';
    END IF;
END $$;
```

Repeat this for each hospital you want to create a staff login for.
