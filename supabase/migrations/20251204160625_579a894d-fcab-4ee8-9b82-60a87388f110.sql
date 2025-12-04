-- Delete 401-AJ product and its dyeing costs
DELETE FROM dyeing_costs WHERE product_id = '4762e897-1b5d-4cc2-944a-b5308c612eb1';
DELETE FROM products WHERE id = '4762e897-1b5d-4cc2-944a-b5308c612eb1';

-- Update 401 to be "401 - LAVAÇÃO" (washing product, no colors)
UPDATE products 
SET name = '401 - LAVAÇÃO',
    code = '401-LAVACAO',
    composition = '91% POLIAMIDA - 9% ELASTANO',
    efficiency_factor = 0.93,
    weaving_cost = 4.95,
    weight_gsm = 180,
    width_cm = 1.65,
    yield_m_kg = 3.40
WHERE id = '9cf17199-dad0-461f-aea5-6090912501b7';

-- Remove all dyeing costs for LAVAÇÃO and add single washing cost
DELETE FROM dyeing_costs WHERE product_id = '9cf17199-dad0-461f-aea5-6090912501b7';

-- Insert LAVAÇÃO cost (washing process, not a color)
INSERT INTO dyeing_costs (product_id, color_id, cost)
SELECT '9cf17199-dad0-461f-aea5-6090912501b7', id, 5.39
FROM colors WHERE name = 'BRANCO' LIMIT 1;

-- Rename 401-PEDRINI to "401 - PEDRINI"
UPDATE products 
SET name = '401 - PEDRINI'
WHERE id = '4f0a6a90-2809-4d17-9da1-06e2d61b4e3d';

-- Rename 401-LIGHT to "401 - PEDRINI LIGHT"
UPDATE products 
SET name = '401 - PEDRINI LIGHT'
WHERE id = '869d1762-e05a-4ba6-9b54-78bab5f419cb';

-- Rename 401-MAX to "401 - PEDRINI MAX"
UPDATE products 
SET name = '401 - PEDRINI MAX'
WHERE id = 'b26687a1-4d15-4eeb-9602-72927727d712';