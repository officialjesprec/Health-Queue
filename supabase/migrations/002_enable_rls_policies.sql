-- Migration: Row Level Security Policies
-- Description: Enable RLS and create security policies for all tables
-- Created: 2026-02-07

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HOSPITALS POLICIES (Public Read)
-- ============================================
CREATE POLICY "Hospitals are viewable by everyone"
  ON public.hospitals FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert hospitals"
  ON public.hospitals FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM public.staff WHERE role = 'admin'));

CREATE POLICY "Only admins can update hospitals"
  ON public.hospitals FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM public.staff WHERE hospital_id = hospitals.id AND role = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.staff WHERE hospital_id = hospitals.id AND role = 'admin'));

-- ============================================
-- USERS POLICIES (Own Data Only)
-- ============================================
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff can view user data for their hospital"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.hospital_profiles hp
      JOIN public.staff s ON s.hospital_id = hp.hospital_id
      WHERE hp.user_id = users.id AND s.id = auth.uid()
    )
  );

-- ============================================
-- HOSPITAL PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view their own hospital profiles"
  ON public.hospital_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hospital profiles"
  ON public.hospital_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view profiles for their hospital"
  ON public.hospital_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.hospital_id = hospital_profiles.hospital_id
      AND staff.id = auth.uid()
    )
  );

CREATE POLICY "Staff can update profiles for their hospital"
  ON public.hospital_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.hospital_id = hospital_profiles.hospital_id
      AND staff.id = auth.uid()
    )
  );

-- ============================================
-- QUEUE ITEMS POLICIES
-- ============================================
CREATE POLICY "Patients can view their own queue items"
  ON public.queue_items FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own queue items"
  ON public.queue_items FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Staff can view queue items for their hospital"
  ON public.queue_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.hospital_id = queue_items.hospital_id
      AND staff.id = auth.uid()
    )
  );

CREATE POLICY "Staff can update queue items for their hospital"
  ON public.queue_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.hospital_id = queue_items.hospital_id
      AND staff.id = auth.uid()
    )
  );

CREATE POLICY "Staff can delete queue items for their hospital"
  ON public.queue_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.hospital_id = queue_items.hospital_id
      AND staff.id = auth.uid()
      AND staff.role IN ('admin', 'receptionist')
    )
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- STAFF POLICIES
-- ============================================
CREATE POLICY "Staff can view themselves"
  ON public.staff FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view staff in their hospital"
  ON public.staff FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.hospital_id = staff.hospital_id
      AND s.id = auth.uid()
      AND s.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert staff for their hospital"
  ON public.staff FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.hospital_id = hospital_id
      AND s.id = auth.uid()
      AND s.role = 'admin'
    )
  );

CREATE POLICY "Admins can update staff for their hospital"
  ON public.staff FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.staff s
      WHERE s.hospital_id = staff.hospital_id
      AND s.id = auth.uid()
      AND s.role = 'admin'
    )
  );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view payments for their hospital"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.hospital_id = payments.hospital_id
      AND staff.id = auth.uid()
    )
  );

-- ============================================
-- FEEDBACK POLICIES
-- ============================================
CREATE POLICY "Users can view their own feedback"
  ON public.feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public feedback is viewable by everyone"
  ON public.feedback FOR SELECT
  USING (is_public = true);

CREATE POLICY "Staff can view feedback for their hospital"
  ON public.feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.hospital_id = feedback.hospital_id
      AND staff.id = auth.uid()
    )
  );

-- ============================================
-- ANALYTICS EVENTS POLICIES
-- ============================================
CREATE POLICY "Staff can view analytics for their hospital"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.staff
      WHERE staff.hospital_id = analytics_events.hospital_id
      AND staff.id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);
