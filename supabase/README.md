# Database Setup Instructions

## Running the Migrations

You have 3 options to run these migrations on your Supabase project:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard/project/qneyzjlszbfnkvqagwlx
2. Click on **SQL Editor** in the left sidebar
3. Run each migration file in order:
   - Copy and paste `001_create_initial_schema.sql`
   - Click "Run" or press Ctrl+Enter
   - Repeat for `002_enable_rls_policies.sql`
   - Repeat for `003_realtime_and_functions.sql`
   - Finally run `seed.sql` for test data

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref qneyzjlszbfnkvqagwlx

# Run migrations
supabase db push

# Or run individually
supabase db execute --file supabase/migrations/001_create_initial_schema.sql
supabase db execute --file supabase/migrations/002_enable_rls_policies.sql
supabase db execute --file supabase/migrations/003_realtime_and_functions.sql
supabase db execute --file supabase/seed.sql
```

### Option 3: Using psql (Advanced)

```bash
# Get database connection string from Supabase dashboard
# Settings > Database > Connection string > URI

psql "postgresql://postgres:[YOUR-PASSWORD]@db.qneyzjlszbfnkvqagwlx.supabase.co:5432/postgres" -f supabase/migrations/001_create_initial_schema.sql
```

## What Each Migration Does

### 001_create_initial_schema.sql
- Creates 9 tables:
  - `hospitals` - Hospital information
  - `users` - Patient profiles
  - `hospital_profiles` - Patient-hospital registrations
  - `queue_items` - Appointment queue
  - `notifications` - User notifications
  - `staff` - Hospital staff
  - `payments` - Payment records
  - `feedback` - Patient feedback
  - `analytics_events` - Analytics tracking
- Creates indexes for performance
- Sets up update triggers

### 002_enable_rls_policies.sql
- Enables Row Level Security on all tables
- Creates policies for:
  - Patients can only see their own data
  - Staff can see data for their hospital
  - Public can view hospital information
  - Proper access control for all operations

### 003_realtime_and_functions.sql
- Enables realtime subscriptions for:
  - Queue updates
  - Notifications
  - Analytics events
- Creates helper functions:
  - `generate_ticket_id()` - Unique ticket generation
  - `calculate_queue_position()` - Queue positioning
  - `estimate_wait_time()` - Wait time estimation
  - `advance_queue()` - Move next patient
  - `update_queue_positions()` - Auto-recalculate positions
  - `create_notification()` - Send notifications
  - `log_analytics_event()` - Track analytics

### seed.sql
- Creates 3 test hospitals:
  - General Hospital Lagos
  - University Teaching Hospital Ibadan
  - Abuja National Hospital
- Includes departments, services, and operating hours

## Verify Installation

After running migrations, verify in Supabase dashboard:

1. **Database > Tables** - Should see 9 tables
2. **Authentication > Policies** - Should see RLS enabled
3. **Database > Publications** - Should see realtime enabled for queue_items, notifications, analytics_events

## Next Steps

After migrations are complete:
1. Test the connection in the app
2. Create test user accounts
3. Book test appointments
4. Verify realtime updates work
