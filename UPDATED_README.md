# HealthQueue - Modern Healthcare Queue Management

HealthQueue is a comprehensive system designed to streamline patient intake and queue management in hospitals, reducing waiting times and improving administrative efficiency for healthcare providers.

## Features

- **For Patients:**
  - Easy online booking and registration
  - Real-time queue status tracking
  - Digital medical card management
  - Push notifications for appointments

- **For Hospitals:**
  - Complete admin dashboard
  - Role-based access for staff (Doctors, Nurses, Pharmacists)
  - Department-specific queue management
  - Patient journey tracking (Check-in → Triage → Doctor → Pharmacy)

## Tech Stack

- **Frontend:** React + Vite + TypeScript + TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Deployment:** Vercel

## Configuration

This project requires a Supabase backend. Set up the following environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`

## Deployment

Pushes to the `main` branch automatically deploy to Vercel.
