-- Add conversion_factor column to tinturarias table
ALTER TABLE public.tinturarias 
ADD COLUMN conversion_factor numeric NOT NULL DEFAULT 0;