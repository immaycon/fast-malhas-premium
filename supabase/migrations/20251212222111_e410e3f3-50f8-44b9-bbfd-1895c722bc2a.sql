-- Adjust unique constraint for dyeing_costs to include tinturaria_id
ALTER TABLE public.dyeing_costs
  DROP CONSTRAINT IF EXISTS dyeing_costs_product_id_color_id_key;

ALTER TABLE public.dyeing_costs
  ADD CONSTRAINT dyeing_costs_product_id_color_id_tinturaria_id_key
  UNIQUE (product_id, color_id, tinturaria_id);