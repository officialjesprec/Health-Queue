# Critical Fix: Hospital Signup Flow

## Issue Reported
User created an account through hospital signup but couldn't log in to staff dashboard. Got "incorrect details" error.

## Root Cause
The hospital signup flow had a critical logic error:

### Previous (Broken) Flow:
1. User goes to `/hospital/signup`
2. Fills out admin form and submits
3. `signUp()` creates record in `auth.users` ✅
4. User is redirected to `/hospital/login` ❌
5. User tries to login
6. HospitalLogin checks `staff` table for this user
7. **Staff record doesn't exist yet!** ❌
8. Login fails with "incorrect details"

### Why Staff Record Wasn't Created:
The staff record is only created by a database trigger that fires when a **hospital is registered** (see migration `006_enable_hospital_registration.sql`):

```sql
CREATE TRIGGER on_hospital_created
  AFTER INSERT ON public.hospitals
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_hospital();
```

This trigger automatically creates a staff record linking the user to the hospital. But the user skipped the hospital registration step!

## The Fix

### New (Correct) Flow:
1. User goes to `/hospital/signup`
2. Fills out admin form and submits
3. `signUp()` creates record in `auth.users` ✅
4. Supabase auto-logs user in (in development mode) ✅
5. User is redirected to `/register-hospital` ✅
6. User fills out and submits hospital registration form
7. Hospital is created in database
8. **Trigger fires → Staff record created automatically** ✅
9. User is redirected to admin dashboard
10. User can now login as staff anytime ✅

### Fallback for Production:
If email confirmation is required (production mode):
1-3. Same as above
4. User receives email confirmation
5. Redirected to `/hospital/login?redirect=/register-hospital`
6. User confirms email and logs in
7. After login, redirected to hospital registration
8-10. Same as above

## Code Changes

### File: `src/pages/auth/HospitalSignup.tsx`

**Before:**
```typescript
const { error: signUpError } = await signUp(/* ... */);
if (signUpError) throw signUpError;

toast.success('Admin account created! Please sign in.');
navigate(`/hospital/login?redirect=${redirectPath}&email=${form.email}`);
```

**After:**
```typescript
const { data, error: signUpError } = await signUp(/* ... */);
if (signUpError) throw signUpError;

// Check if user is auto-logged in
if (data.session) {
    // User is logged in → Go directly to hospital registration
    toast.success('Account created! Now register your hospital.');
    navigate('/register-hospital');
} else {
    // Email confirmation required → Login first, then register
    toast.success('Account created! Please check your email to confirm, then login.');
    navigate(`/hospital/login?redirect=/register-hospital&email=${form.email}`);
}
```

## Database Trigger (Already Exists)

The critical piece that makes this work:

```sql
-- In migration 006_enable_hospital_registration.sql
CREATE OR REPLACE FUNCTION public.handle_new_hospital()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically create staff record for hospital creator
  INSERT INTO public.staff (
    id,
    hospital_id,
    role,
    full_name,
    email
  )
  SELECT
    auth.uid(),           -- Current user's ID
    new.id,              -- New hospital's ID
    'admin',             -- Role
    new_user.raw_user_meta_data->>'full_name',
    new_user.email
  FROM auth.users AS new_user
  WHERE new_user.id = auth.uid();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Testing Checklist

### For Existing Broken Accounts:

If you already created an account but can't login:

**Option 1: Complete Hospital Registration**
1. Go to `/register-hospital` directly
2. Login if prompted
3. Fill out hospital registration form
4. Submit
5. Staff record will be created automatically
6. You can now login to staff portal

**Option 2: Delete and Recreate** (if you haven't registered hospital yet)
1. Delete your account from Supabase dashboard (`auth.users` table)
2. Sign up again using the fixed flow
3. Complete hospital registration
4. Staff record will be created

### For New Accounts:

1. ✅ Go to `/hospital/signup`
2. ✅ Fill out admin information
3. ✅ Click "Create Admin Account"
4. ✅ Should see: "Account created! Now register your hospital."
5. ✅ Should be redirected to `/register-hospital`
6. ✅ Fill out hospital details
7. ✅ Click "Register Hospital"
8. ✅ Hospital ID popup appears
9. ✅ Copy Hospital ID
10. ✅ Redirected to admin dashboard
11. ✅ Sign out
12. ✅ Go to `/hospital/login`
13. ✅ Enter email and password
14. ✅ Should login successfully ✅

## What Changed in the Database Flow

### Before This Fix:
```
auth.users          → Empty
public.patients     → Empty  
public.staff        → Empty (MISSING!)
public.hospitals    → Empty
```

### After This Fix:
```
auth.users          → {id: 'user-123', email: 'admin@hospital.com', ...}
public.patients     → Empty  
public.staff        → {id: 'user-123', hospital_id: 'hosp-456', role: 'admin', ...} ✅
public.hospitals    → {id: 'hosp-456', name: 'General Hospital', ...} ✅
```

## Key Insights

1. **Staff records are NOT created on signup** - They're created when a hospital is registered
2. **The database trigger is smart** - It links the current user to the new hospital automatically
3. **The signup redirect was wrong** - It sent users to login instead of hospital registration
4. **Email metadata is important** - The trigger pulls `full_name` from `raw_user_meta_data`

## Related Files

- `src/pages/auth/HospitalSignup.tsx` - Fixed signup flow
- `src/pages/HospitalRegistration.tsx` - Creates hospital (triggers staff creation)
- `src/pages/auth/HospitalLogin.tsx` - Verifies staff record exists
- `supabase/migrations/006_enable_hospital_registration.sql` - Contains the trigger

## Status

✅ **FIXED AND TESTED**

The correct flow now ensures:
1. User signs up
2. User registers hospital
3. Staff record is created automatically
4. User can login to staff portal

No more "incorrect details" errors for properly registered hospital admins!
