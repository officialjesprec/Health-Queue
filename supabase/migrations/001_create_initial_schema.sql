-- Migration: Create Initial Schema
-- Description: Create all tables for Health Queue system
-- Created: 2026-02-07

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- HOSPITALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  departments JSONB DEFAULT '[]'::jsonb,
  services JSONB DEFAULT '{}'::jsonb,
  is_open BOOLEAN DEFAULT true,
  registration_fee DECIMAL(10, 2) DEFAULT 0,
  operating_hours JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  next_of_kin JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HOSPITAL PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.hospital_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  card_id TEXT UNIQUE NOT NULL,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  is_paid BOOLEAN DEFAULT false,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, hospital_id)
);

-- ============================================
-- QUEUE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.queue_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  ticket_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stage TEXT NOT NULL DEFAULT 'check_in',
  department TEXT NOT NULL,
  service TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  is_emergency BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending',
  notified BOOLEAN DEFAULT false,
  queue_position INTEGER,
  estimated_wait_time INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'waiting', 'in_progress', 'delayed', 'completed', 'cancelled')),
  CONSTRAINT valid_stage CHECK (stage IN ('check_in', 'triage', 'billing', 'doctor', 'pharmacy')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'paid', 'not_required'))
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  queue_item_id UUID REFERENCES public.queue_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sent_via TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_notification_type CHECK (type IN ('reminder', 'update', 'emergency', 'system'))
);

-- ============================================
-- STAFF TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_staff_role CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'))
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type TEXT NOT NULL,
  payment_method TEXT,
  payment_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_payment_type CHECK (payment_type IN ('registration', 'consultation', 'pharmacy', 'other')),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('card', 'cash', 'bank_transfer', 'mobile_money')),
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- ============================================
-- FEEDBACK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  queue_item_id UUID REFERENCES public.queue_items(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT valid_category CHECK (category IN ('waiting_time', 'staff', 'facilities', 'overall'))
);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  department TEXT,
  service TEXT,
  duration INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('booking', 'check_in', 'completion', 'cancellation', 'no_show'))
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_queue_items_patient ON queue_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_queue_items_hospital ON queue_items(hospital_id);
CREATE INDEX IF NOT EXISTS idx_queue_items_status ON queue_items(status);
CREATE INDEX IF NOT EXISTS idx_queue_items_date ON queue_items(appointment_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_user ON hospital_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_hospital ON staff(hospital_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_hospital_date ON analytics_events(hospital_id, created_at);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hospitals_updated_at 
  BEFORE UPDATE ON hospitals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_items_updated_at 
  BEFORE UPDATE ON queue_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
