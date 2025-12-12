-- Create tinturarias table
CREATE TABLE public.tinturarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tinturarias ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage tinturarias" 
ON public.tinturarias 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can view tinturarias" 
ON public.tinturarias 
FOR SELECT 
USING (true);

-- Add tinturaria_id to dyeing_costs
ALTER TABLE public.dyeing_costs 
ADD COLUMN tinturaria_id UUID REFERENCES public.tinturarias(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_dyeing_costs_tinturaria ON public.dyeing_costs(tinturaria_id);
CREATE INDEX idx_dyeing_costs_product_tinturaria ON public.dyeing_costs(product_id, tinturaria_id);