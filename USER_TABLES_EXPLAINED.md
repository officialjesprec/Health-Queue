# Understanding User Tables in Health Queue

## ⚠️ Important: How Authentication Works

### The Three Tables Explained

```
┌─────────────────────────────────────────────────────────────┐
│                    auth.users (Supabase)                     │
│  • Managed by Supabase Auth                                  │
│  • Contains ALL users (patients + staff)                     │
│  • Required for login functionality                          │
│  • You CANNOT customize or remove this                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├──────────────────┬──────────────────┐
                              ▼                  ▼                  ▼
                   ┌──────────────────┐ ┌──────────────────┐   ┌──────────┐
                   │ public.patients  │ │  public.staff    │   │ No Table │
                   │ (Patient data)   │ │  (Staff data)    │   │ (Deleted)│
                   └──────────────────┘ └──────────────────┘   └──────────┘
```

## Why Staff Appear in auth.users

**This is CORRECT and REQUIRED.**

Here's why:

### 1. Supabase Requirement
- **Every authenticated user MUST exist in `auth.users`**
- This is Supabase's core authentication table
- It handles login, sessions, passwords, email verification
- You cannot have authentication without it

### 2. How We Differentiate Users

Instead of separate user tables, we use **reference tables**:

| Table | Purpose | Contains |
|-------|---------|----------|
| `auth.users` | Authentication | ALL users (patients + staff) |
| `public.patients` | Patient-specific data | Only patient records |
| `public.staff` | Staff-specific data | Only staff records |

### 3. The Link

Both `patients` and `staff` tables have an `id` column that references `auth.users.id`:

```sql
-- Patient record
INSERT INTO public.patients (id, full_name, ...)
VALUES ('user-uuid-from-auth-users', 'John Doe', ...);

-- Staff record  
INSERT INTO public.staff (id, full_name, hospital_id, ...)
VALUES ('user-uuid-from-auth-users', 'Dr. Smith', 'hospital-uuid', ...);
```

## How to View Patients vs Staff

### Method 1: Query Patients Only

```sql
SELECT u.email, p.full_name, p.phone
FROM auth.users u
INNER JOIN public.patients p ON u.id = p.id;
```

### Method 2: Query Staff Only

```sql
SELECT u.email, s.full_name, s.role, h.name as hospital
FROM auth.users u
INNER JOIN public.staff s ON u.id = s.id
INNER JOIN public.hospitals h ON s.hospital_id = h.id;
```

### Method 3: Query All Users with Type

```sql
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN p.id IS NOT NULL THEN 'Patient'
    WHEN s.id IS NOT NULL THEN 'Staff'
    ELSE 'Unknown'
  END as user_type,
  COALESCE(p.full_name, s.full_name) as name
FROM auth.users u
LEFT JOIN public.patients p ON u.id = p.id
LEFT JOIN public.staff s ON u.id = s.id;
```

## What Happens During Sign Up

### Patient Sign Up (`/auth/signup`)

1. ✅ Create record in `auth.users` (email, password, etc.)
2. ✅ Create record in `public.patients` (full_name, phone, etc.)
3. ❌ No record in `public.staff`

### Staff/Hospital Sign Up (`/hospital/signup`)

1. ✅ Create record in `auth.users` (email, password, etc.)
2. ✅ Create record in `public.staff` (full_name, role, hospital_id, etc.)
3. ❌ No record in `public.patients`

## Security: How We Prevent Mix-Ups

### In Code (HospitalLogin.tsx)

```typescript
// After authentication, verify user is staff
const { data: staffData } = await supabase
  .from('staff')
  .select('*')
  .eq('id', user.id)
  .single();

if (!staffData) {
  // User authenticated but not in staff table = Patient trying to access staff portal
  await supabase.auth.signOut();
  setError('Access denied: Staff login only');
}
```

### In Database (Row Level Security)

```sql
-- Patients can only see their own data
CREATE POLICY "Patients can view own data"
ON public.patients
FOR SELECT
USING (auth.uid() = id);

-- Staff can only see data for their hospital
CREATE POLICY "Staff can view hospital data"
ON public.queue
FOR SELECT
USING (
  hospital_id IN (
    SELECT hospital_id 
    FROM public.staff 
    WHERE id = auth.uid()
  )
);
```

## Common Misunderstandings

### ❌ Wrong: "Staff shouldn't be in auth.users"
**Why it's wrong:** auth.users is required for all authentication. You cannot log in without a record there.

### ✅ Correct: "Staff and patients are differentiated by reference tables"
**Why it's right:** auth.users handles login, while staff/patients tables determine permissions and access.

### ❌ Wrong: "Delete auth.users records for staff"
**Why it's wrong:** They won't be able to log in anymore!

### ✅ Correct: "Query staff and patients separately when needed"
**Why it's right:** Use JOINs to get the specific data you need.

## Creating Custom Views (Optional)

If you want easier access to patient-only or staff-only data, create views:

```sql
-- View for patients only
CREATE VIEW patients_with_auth AS
SELECT 
  u.email,
  u.created_at as account_created,
  p.*
FROM auth.users u
INNER JOIN public.patients p ON u.id = p.id;

-- View for staff only  
CREATE VIEW staff_with_auth AS
SELECT 
  u.email,
  u.created_at as account_created,
  s.*,
  h.name as hospital_name
FROM auth.users u
INNER JOIN public.staff s ON u.id = s.id
INNER JOIN public.hospitals h ON s.hospital_id = h.id;
```

Then query them:

```sql
-- Get all patients
SELECT * FROM patients_with_auth;

-- Get all staff
SELECT * FROM staff_with_auth;
```

## Summary

✅ **All users (patients AND staff) will appear in auth.users - THIS IS CORRECT**

✅ **Use public.patients and public.staff to differentiate**

✅ **Join tables when you need to see user type**

✅ **The system is working as designed**

❌ **Don't try to separate authentication by user type - it won't work**

## Questions?

- "Why do I see staff emails in auth.users?" → **Because they need to log in!**
- "Can I hide staff from auth.users?" → **No, and you shouldn't want to**
- "How do I see only patients?" → **Use JOIN query or create a view**
- "Is this a security risk?" → **No, access control is handled by RLS policies on other tables**
