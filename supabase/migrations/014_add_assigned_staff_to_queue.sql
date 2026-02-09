-- Add assigned_staff_id to queue_items
ALTER TABLE public.queue_items 
ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;
