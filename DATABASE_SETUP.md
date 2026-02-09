# Database Setup and Management Guide

## Quick Start

### 1. Apply Seed Data (Add Hospitals to Database)

You can add the sample hospitals to your Supabase database in two ways:

#### Option A: Through Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the contents of `supabase/seed_hospitals.sql`
5. Paste into the SQL editor
6. Click **Run** button

#### Option B: Using Supabase CLI
```bash
# Make sure you're in the project directory
cd Health-Queue

# Run the seed file
supabase db reset --db-url "your-database-url"

# Or run seed file directly
psql "your-database-url" -f supabase/seed_hospitals.sql
```

---

## What Gets Seeded

The `seed_hospitals.sql` file adds **6 hospitals** to your database:

1. **General Hospital Lagos** (Victoria Island, Lagos)
   - Departments: Emergency, OPD, Pediatrics, Obstetrics, Surgery, Lab, Pharmacy
   - Registration Fee: ₦3,500

2. **University Teaching Hospital Ibadan** (Ibadan, Oyo State)
   - Departments: Emergency, Cardiology, Neurology, Oncology, Orthopedics, OPD, Lab, Pharmacy
   - Registration Fee: ₦5,000
   - 24/7 Operation

3. **Abuja National Hospital** (Central Area, Abuja)
   - Departments: Emergency, OPD, Dermatology, ENT, Radiology, Lab, Pharmacy
   - Registration Fee: ₦4,000

4. **St. Nicholas Hospital** (Lekki, Lagos)
   - Departments: OPD, Pediatrics, Obstetrics, Dental, Lab, Pharmacy
   - Registration Fee: ₦3,000

5. **Cedarcrest Hospitals** (Gudu, Abuja)
   - Departments: OPD, ENT, Ophthalmology, Dental, Lab, Pharmacy
   - Registration Fee: ₦2,500

6. **Lagoon Hospitals** (Ikeja, Lagos)
   - Departments: Emergency, OPD, Surgery, Radiology, Lab, Pharmacy
   - Registration Fee: ₦4,500
   - 24/7 Operation

---

## Verifying Seed Data

After running the seed file, verify hospitals were added:

### Through Supabase Dashboard:
1. Go to **Table Editor**
2. Select `hospitals` table
3. You should see 6 hospitals

### Through SQL:
```sql
SELECT id, name, location, registration_fee, is_open 
FROM public.hospitals 
ORDER BY name;
```

Expected result: 6 rows

---

## Troubleshooting

### Issue: "Hospital Not Found" Error

**Problem:** When trying to book appointments, you get "Hospital not found" error.

**Solutions:**

1. **Check if hospitals exist in database:**
   ```sql
   SELECT COUNT(*) FROM public.hospitals;
   ```
   - If count is 0, run the seed file

2. **Check if Row Level Security (RLS) is blocking reads:**
   ```sql
   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'hospitals';
   
   -- Temporarily disable RLS for testing (NOT for production)
   ALTER TABLE public.hospitals DISABLE ROW LEVEL SECURITY;
   ```

3. **Verify hospitals are marked as open:**
   ```sql
   UPDATE public.hospitals SET is_open = true WHERE is_open = false;
   ```

### Issue: Seed File Runs But No Data Appears

**Check for conflicts:**
```sql
-- See if hospitals with these IDs already exist
SELECT id, name FROM public.hospitals 
WHERE id IN (
  'a1b2c3d4-e5f6-7890-ab12-cd34ef567890',
  'b2c3d4e5-f6a7-8901-bc23-de45ef678901',
  'c3d4e5f6-a7b8-9012-cd34-ef56ab789012',
  'd4e5f6a7-b8c9-0123-de45-fa67bc890123',
  'e5f6a7b8-c9d0-1234-ef56-ab78cd901234',
  'f6a7b8c9-d0e1-2345-af67-bc89de012345'
);
```

If they exist, the seed file will UPDATE them instead of creating new ones.

---

## Reset Database (⚠️ Destructive)

To start fresh:

```sql
-- Delete all hospitals
DELETE FROM public.hospitals;

-- Then re-run seed file
```

**Warning:** This will delete ALL hospitals including any you created through the app!

---

## Adding More Hospitals Manually

### Through App:
1. Navigate to `/register-hospital`
2. Create hospital admin account if needed
3. Fill out hospital registration form
4. Submit

### Through SQL:
```sql
INSERT INTO public.hospitals (
  name, 
  location, 
  address, 
  phone, 
  departments, 
  services, 
  is_open, 
  registration_fee
) VALUES (
  'Your Hospital Name',
  'City, State',
  'Full Address',
  '+234-XXX-XXX-XXXX',
  '["OPD", "Emergency", "Laboratory"]'::jsonb,
  '{
    "OPD": ["General Consultation", "Health Check"],
    "Emergency": ["Emergency Care"],
    "Laboratory": ["Blood Test"]
  }'::jsonb,
  true,
  2500.00
);
```

---

## Database Health Checks

Run these queries to ensure everything is working:

```sql
-- Check total hospitals
SELECT COUNT(*) as total_hospitals FROM public.hospitals;

-- Check hospitals by location
SELECT location, COUNT(*) as count 
FROM public.hospitals 
GROUP BY location;

-- Check open vs closed hospitals
SELECT is_open, COUNT(*) as count 
FROM public.hospitals 
GROUP BY is_open;

-- Check average registration fees
SELECT AVG(registration_fee) as avg_fee 
FROM public.hospitals;
```

---

## Support

If you're still experiencing issues:
1. Check Supabase logs for errors
2. Verify your database connection string
3. Ensure migrations have been applied
4. Check RLS policies aren't blocking reads

For more help, see `ISSUE_ANALYSIS.md` for detailed troubleshooting.
