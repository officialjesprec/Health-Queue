# Quick Migration Instructions

## Copy-Paste Method (Fastest - 2 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/qneyzjlszbfnkvqagwlx/sql
2. Click "New Query" button

### Step 2: Run Each Migration

#### Migration 1: Create Tables
1. Open file: `supabase/migrations/001_create_initial_schema.sql`
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Paste in Supabase SQL editor
4. Click "Run" (or press Ctrl+Enter)
5. Wait for "Success" message

#### Migration 2: Enable Security
1. Open file: `supabase/migrations/002_enable_rls_policies.sql`
2. Copy ALL content
3. Paste in SQL editor
4. Click "Run"
5. Wait for "Success"

#### Migration 3: Enable Realtime
1. Open file: `supabase/migrations/003_realtime_and_functions.sql`
2. Copy ALL content
3. Paste in SQL editor
4. Click "Run"
5. Wait for "Success"

#### Migration 4: Add Test Data (Optional)
1. Open file: `supabase/seed.sql`
2. Copy ALL content
3. Paste in SQL editor
4. Click "Run"
5. This creates 3 test hospitals

### Step 3: Verify
1. Click "Table Editor" in Supabase sidebar
2. You should see 9 tables:
   - analytics_events
   - feedback
   - hospital_profiles
   - hospitals
   - notifications
   - payments
   - queue_items
   - staff
   - users

### Step 4: Tell Me It's Done!
Once you see all 9 tables, let me know! We'll immediately continue with:
- Authentication system
- Supabase integration
- UI redesign
- All the features!

---

## Alternative: Quick CLI Method

If you prefer command line:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project  
supabase link --project-ref qneyzjlszbfnkvqagwlx

# Push all databases
supabase db push
```

---

## What Each Migration Does (Reference)

**001_create_initial_schema.sql** (2KB)
- Creates 9 tables
- 15 indexes for performance
- 3 triggers for auto-updates

**002_enable_rls_policies.sql** (5KB)
- Enables Row Level Security
- 32 access control policies
- Protects patient data

**003_realtime_and_functions.sql** (4KB)
- Enables live updates
- 7 helper functions
- Queue management automation

**seed.sql** (3KB)
- 3 Nigerian hospitals
- Departments & services
- Operating hours

**Total SQL:** ~14KB | **Execution time:** ~30 seconds

---

## ❓ Troubleshooting

**Error: "relation already exists"**
- Some tables might already exist
- Option 1: Drop existing tables first
- Option 2: Skip that part (usually safe)

**Error: "permission denied"**
- Check you're on the right project
- Verify you're logged in

**No error but no tables?**
- Refresh the page
- Click "Table Editor" again
- Check "Database" > "Tables" tab

---

## 🎯 After Migrations

Reply with: **"Migrations complete!"**

And I'll immediately start building:
1. Authentication system
2. Real-time features  
3. UI redesign
4. All the cool features!

Let's go! 🚀
