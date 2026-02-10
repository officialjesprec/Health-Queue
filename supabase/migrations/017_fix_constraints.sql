-- Fix constraints for status and stage to include missing values
ALTER TABLE public.queue_items DROP CONSTRAINT IF EXISTS valid_status;
ALTER TABLE public.queue_items ADD CONSTRAINT valid_status 
  CHECK (status IN ('pending', 'waiting', 'in_progress', 'delayed', 'completed', 'cancelled', 'upcoming'));

ALTER TABLE public.queue_items DROP CONSTRAINT IF EXISTS valid_stage;
ALTER TABLE public.queue_items ADD CONSTRAINT valid_stage 
  CHECK (stage IN ('check_in', 'triage', 'billing', 'doctor', 'pharmacy', 'completed'));
