# 🔧 Fix: Staff Table Column Error

## Problem
When creating a hospital portal, you're getting the error:
```
column "name" of relation "staff" does not exist
```

## Cause
The `handle_new_hospital()` function was trying to insert into a column called `name`, but the actual column in the `staff` table is called `full_name`.

## Solution
Run the migration to fix the function. You have 2 options:

---

### Option 1: Run via Supabase Dashboard (Easiest)

1. **Go to your Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/qneyzjlszbfnkvqagwlx

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar

3. **Copy and paste this SQL:**
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_hospital()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.staff (
       id,
       hospital_id,
       role,
       full_name,
       email
     )
     SELECT
       auth.uid(),
       NEW.id,
       'admin',
       new_user.raw_user_meta_data->>'full_name',
       new_user.email
     FROM auth.users AS new_user
     WHERE new_user.id = auth.uid();

     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

4. **Click "RUN"** (or press Ctrl+Enter)

5. **You should see:** `Success. No rows returned`

---

### Option 2: Use the Migration File

The SQL is already saved in:
```
supabase/migrations/007_fix_staff_column_name.sql
```

Just copy its contents and run in the SQL Editor as described above.

---

## ✅ Verify the Fix

After running the migration, try creating a hospital portal again. The error should be gone!

---

## What Was Changed

**Before (incorrect):**
```sql
INSERT INTO public.staff (
  id, hospital_id, role, name, email  -- ❌ 'name' doesn't exist
)
```

**After (correct):**
```sql
INSERT INTO public.staff (
  id, hospital_id, role, full_name, email  -- ✅ 'full_name' matches schema
)
```

---

## Need Help?

If you still encounter issues, check:
1. You're logged in to Supabase dashboard
2. You're using the correct project (qneyzjlszbfnkvqagwlx)
3. The SQL ran without errors
