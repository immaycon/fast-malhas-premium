-- Criar tabela para custos de frete diários
CREATE TABLE public.freight_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price NUMERIC NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(effective_date)
);

-- Enable RLS
ALTER TABLE public.freight_prices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage freight prices" 
ON public.freight_prices 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone authenticated can view freight prices" 
ON public.freight_prices 
FOR SELECT 
USING (true);