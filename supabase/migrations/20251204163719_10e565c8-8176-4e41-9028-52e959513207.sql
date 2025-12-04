-- Create LAVAÇÃO color for washing service
INSERT INTO colors (name, scale, category)
VALUES ('LAVAÇÃO', 'ESPECIAL', 'Serviço')
ON CONFLICT DO NOTHING;

-- Update dyeing cost for 401-LAVAÇÃO to use the LAVAÇÃO color
UPDATE dyeing_costs 
SET color_id = (SELECT id FROM colors WHERE name = 'LAVAÇÃO' LIMIT 1)
WHERE product_id = '9cf17199-dad0-461f-aea5-6090912501b7';