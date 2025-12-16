-- Add order_number column to quotes table for unique sequential identification
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS order_number SERIAL;

-- Create unique index on order_number
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotes_order_number ON public.quotes(order_number);

-- Update quote_data column comment to document stored fields
COMMENT ON COLUMN public.quotes.quote_data IS 'Stores complete quote snapshot: tinturaria_id, tinturaria_name, product_code, product_name, customer_name, payment_method, adm_description, conversion_factor, special_discount, colors (name, kg, cost_per_kg), yarn_prices (yarn_type_id, price), freight_price, efficiency_factor, weaving_cost';