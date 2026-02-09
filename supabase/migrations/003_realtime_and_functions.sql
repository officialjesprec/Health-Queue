-- Migration: Realtime and Helper Functions
-- Description: Enable realtime subscriptions and create helper functions
-- Created: 2026-02-07

-- ============================================
-- ENABLE REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate unique ticket IDs
CREATE OR REPLACE FUNCTION generate_ticket_id(hospital_code TEXT, department_code TEXT)
RETURNS TEXT AS $$
DECLARE
  random_suffix TEXT;
  ticket_id TEXT;
BEGIN
  random_suffix := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  ticket_id := UPPER(hospital_code) || '-' || UPPER(department_code) || '-' || random_suffix;
  RETURN ticket_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate queue position
CREATE OR REPLACE FUNCTION calculate_queue_position(
  p_hospital_id UUID,
  p_department TEXT,
  p_appointment_date DATE,
  p_is_emergency BOOLEAN
)
RETURNS INTEGER AS $$
DECLARE
  position INTEGER;
BEGIN
  IF p_is_emergency THEN
    SELECT COUNT(*) + 1 INTO position
    FROM public.queue_items
    WHERE hospital_id = p_hospital_id
    AND department = p_department
    AND appointment_date = p_appointment_date
    AND status IN ('pending', 'waiting')
    AND is_emergency = true;
  ELSE
    SELECT COUNT(*) + 1 INTO position
    FROM public.queue_items
    WHERE hospital_id = p_hospital_id
    AND department = p_department
    AND appointment_date = p_appointment_date
    AND status IN ('pending', 'waiting');
  END IF;
  
  RETURN position;
END;
$$ LANGUAGE plpgsql;

-- Function to estimate wait time
CREATE OR REPLACE FUNCTION estimate_wait_time(
  p_hospital_id UUID,
  p_department TEXT,
  p_queue_position INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  avg_service_time INTEGER;
  estimated_time INTEGER;
BEGIN
  -- Get average service time from analytics (default to 30 minutes)
  SELECT COALESCE(AVG(duration), 30) INTO avg_service_time
  FROM public.analytics_events
  WHERE hospital_id = p_hospital_id
  AND department = p_department
  AND event_type = 'completion'
  AND created_at > NOW() - INTERVAL '30 days';
  
  estimated_time := (p_queue_position - 1) * avg_service_time;
  
  RETURN estimated_time;
END;
$$ LANGUAGE plpgsql;

-- Function to advance queue (move next patient to in_progress)
CREATE OR REPLACE FUNCTION advance_queue(
  p_hospital_id UUID,
  p_department TEXT
)
RETURNS UUID AS $$
DECLARE
  next_patient_id UUID;
BEGIN
  -- Get emergency patients first
  SELECT id INTO next_patient_id
  FROM public.queue_items
  WHERE hospital_id = p_hospital_id
  AND department = p_department
  AND status = 'waiting'
  AND is_emergency = true
  ORDER BY created_at ASC
  LIMIT 1;
  
  -- If no emergency, get regular patients
  IF next_patient_id IS NULL THEN
    SELECT id INTO next_patient_id
    FROM public.queue_items
    WHERE hospital_id = p_hospital_id
    AND department = p_department
    AND status = 'waiting'
    AND is_emergency = false
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
  
  -- Update status to in_progress
  IF next_patient_id IS NOT NULL THEN
    UPDATE public.queue_items
    SET status = 'in_progress',
        updated_at = NOW()
    WHERE id = next_patient_id;
  END IF;
  
  RETURN next_patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update queue positions after status change
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate queue positions for the department
  WITH numbered_queue AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY hospital_id, department, appointment_date
        ORDER BY is_emergency DESC, created_at ASC
      ) AS new_position
    FROM public.queue_items
    WHERE hospital_id = NEW.hospital_id
    AND department = NEW.department
    AND appointment_date = NEW.appointment_date
    AND status IN ('pending', 'waiting')
  )
  UPDATE public.queue_items
  SET queue_position = numbered_queue.new_position
  FROM numbered_queue
  WHERE queue_items.id = numbered_queue.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update queue positions
CREATE TRIGGER trigger_update_queue_positions
  AFTER INSERT OR UPDATE OF status ON public.queue_items
  FOR EACH ROW
  EXECUTE FUNCTION update_queue_positions();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_queue_item_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, queue_item_id, title, message, type)
  VALUES (p_user_id, p_queue_item_id, p_title, p_message, p_type)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log analytics event
CREATE OR REPLACE FUNCTION log_analytics_event(
  p_hospital_id UUID,
  p_event_type TEXT,
  p_department TEXT,
  p_service TEXT,
  p_duration INTEGER,
  p_metadata JSONB
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    hospital_id,
    event_type,
    department,
    service,
    duration,
    metadata
  )
  VALUES (
    p_hospital_id,
    p_event_type,
    p_department,
    p_service,
    p_duration,
    p_metadata
  )
  RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
