-- Create product_groups table
CREATE TABLE public.product_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage product groups"
ON public.product_groups
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can view product groups"
ON public.product_groups
FOR SELECT
USING (true);

-- Add group_id column to products table
ALTER TABLE public.products ADD COLUMN group_id UUID REFERENCES public.product_groups(id) ON DELETE SET NULL;

-- Insert the groups based on the PDF
INSERT INTO public.product_groups (name) VALUES
  ('Grupo Poliamida'),
  ('Grupo Malha PP Tubular'),
  ('Grupo Malha PP Ramada'),
  ('Grupo Poliester Elastano Acima de 140g'),
  ('Grupo Poliester Termofixado'),
  ('Grupo Estamparia'),
  ('Grupo Poliamida Termofixada'),
  ('Grupo PV'),
  ('Sem Grupo');