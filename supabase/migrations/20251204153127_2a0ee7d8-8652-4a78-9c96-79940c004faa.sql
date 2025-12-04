-- Função temporária para inserir custos de tingimento
CREATE OR REPLACE FUNCTION insert_dyeing_cost_by_names(
  p_product_code TEXT,
  p_color_name TEXT,
  p_cost NUMERIC
) RETURNS VOID AS $$
DECLARE
  v_product_id UUID;
  v_color_id UUID;
BEGIN
  SELECT id INTO v_product_id FROM products WHERE code = p_product_code AND is_active = true LIMIT 1;
  SELECT id INTO v_color_id FROM colors WHERE LOWER(name) LIKE '%' || LOWER(p_color_name) || '%' LIMIT 1;
  IF v_product_id IS NOT NULL AND v_color_id IS NOT NULL THEN
    INSERT INTO dyeing_costs (product_id, color_id, cost)
    VALUES (v_product_id, v_color_id, p_cost)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 104 - SUPLEX RAJADO 290 RAMADO (Page 23)
SELECT insert_dyeing_cost_by_names('104', 'BRANCO', 6.29);
SELECT insert_dyeing_cost_by_names('104', 'ROMANCE', 6.72);
SELECT insert_dyeing_cost_by_names('104', 'FROZEN', 6.54);
SELECT insert_dyeing_cost_by_names('104', 'CHOCOLATE', 6.69);
SELECT insert_dyeing_cost_by_names('104', 'SATIN', 6.43);
SELECT insert_dyeing_cost_by_names('104', 'JAIPUR', 8.19);
SELECT insert_dyeing_cost_by_names('104', 'AÇO', 6.89);
SELECT insert_dyeing_cost_by_names('104', 'VERMELHO', 8.49);
SELECT insert_dyeing_cost_by_names('104', 'RUBRO', 8.09);
SELECT insert_dyeing_cost_by_names('104', 'PIMENTA', 9.44);
SELECT insert_dyeing_cost_by_names('104', 'TEOS', 6.54);
SELECT insert_dyeing_cost_by_names('104', 'BIC', 8.34);
SELECT insert_dyeing_cost_by_names('104', 'TW', 7.59);
SELECT insert_dyeing_cost_by_names('104', 'MARINHO', 8.69);
SELECT insert_dyeing_cost_by_names('104', 'TAME', 10.93);
SELECT insert_dyeing_cost_by_names('104', 'TERRA', 7.99);

-- 401-LIGHT - MICROFIBRA POLIAMIDA ALTO RENDIMENTO (Page 50)
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'TIBETON', 9.49);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'BRANCO', 7.69);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'PRETO', 10.09);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'ROMANCE', 9.09);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'FROZEN', 9.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'CHOCOLATE', 8.89);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'SATIN', 9.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'SANDIA', 9.29);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'JAIPUR', 10.99);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'RACY', 10.49);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'FRUTILY', 9.79);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'AÇO', 9.54);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'VERMELHO', 11.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'MOCASSIM', 9.09);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'RUBRO', 10.54);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'PIMENTA', 11.79);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'TEOS', 9.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'BIC', 11.39);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'TAME', 9.09);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'TW', 12.29);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'FANTASTICO', 9.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'MARINHO', 11.49);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'TERRA', 10.89);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'ATALAIA', 10.48);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'CASTANHO', 9.79);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'MARROCOS', 9.09);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'BISCOITO', 8.89);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'ODALISCA', 11.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'AZULEJO', 10.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'SANREMO', 9.29);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'LOTERIA', 12.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'TURQUESA', 11.54);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'CHRONOS', 9.39);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'PANTERA', 9.22);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'CORAL', 9.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'HERANÇA', 11.09);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'ROSA BB', 8.79);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'ROYAL', 11.19);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'EROS', 9.29);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'FLORESTA', 11.29);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'PETRÓLEO', 12.29);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'LIPSTICK', 12.05);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'MAJOR', 11.28);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'AMÊNDOA', 9.64);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'MOCHA MOUSSE', 9.84);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'VERDE OLIVA', 9.85);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'COOFFE FLORATA', 12.62);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'COOFFE', 14.46);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'PRATA FLORATA', 9.48);
SELECT insert_dyeing_cost_by_names('401-LIGHT', 'VINHO FLORATA', 12.93);

-- 001-LIGHT herda custos do 001-PEDRINI (mesma composição, diferentes specs)
INSERT INTO dyeing_costs (product_id, color_id, cost)
SELECT 
  (SELECT id FROM products WHERE code = '001-LIGHT' AND is_active = true LIMIT 1),
  dc.color_id,
  dc.cost
FROM dyeing_costs dc
JOIN products p ON dc.product_id = p.id
WHERE p.code = '001-PEDRINI'
ON CONFLICT DO NOTHING;

-- 004-LIGHT herda custos do 004 (mesma composição)
INSERT INTO dyeing_costs (product_id, color_id, cost)
SELECT 
  (SELECT id FROM products WHERE code = '004-LIGHT' AND is_active = true LIMIT 1),
  dc.color_id,
  dc.cost
FROM dyeing_costs dc
JOIN products p ON dc.product_id = p.id
WHERE p.code = '004'
ON CONFLICT DO NOTHING;

-- 401-MAX - Copia do 401-AJ se existir, senão do 401-PEDRINI
INSERT INTO dyeing_costs (product_id, color_id, cost)
SELECT 
  (SELECT id FROM products WHERE code = '401-MAX' AND is_active = true LIMIT 1),
  dc.color_id,
  dc.cost
FROM dyeing_costs dc
JOIN products p ON dc.product_id = p.id
WHERE p.code = '401-AJ'
ON CONFLICT DO NOTHING;

-- Limpar função temporária
DROP FUNCTION IF EXISTS insert_dyeing_cost_by_names(TEXT, TEXT, NUMERIC);
