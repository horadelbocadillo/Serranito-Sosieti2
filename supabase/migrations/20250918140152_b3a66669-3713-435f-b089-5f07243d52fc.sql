-- Add event fields to posts table
ALTER TABLE public.posts ADD COLUMN is_event BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN event_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.posts ADD COLUMN event_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.posts ADD COLUMN event_location TEXT;
ALTER TABLE public.posts ADD COLUMN event_description TEXT;