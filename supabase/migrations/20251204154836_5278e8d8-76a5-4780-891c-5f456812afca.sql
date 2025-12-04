
-- Primeiro, deletar os custos incorretos do 001-AJ
DELETE FROM dyeing_costs WHERE product_id = (SELECT id FROM products WHERE code = '001-AJ');

-- Deletar os custos incorretos do 004
DELETE FROM dyeing_costs WHERE product_id = (SELECT id FROM products WHERE code = '004');

-- Atualizar o produto 004 com eficiência correta (0.91) e tecelagem (3.80)
UPDATE products SET 
  efficiency_factor = 0.91,
  weaving_cost = 3.80,
  composition = '93% POLIÉSTER - 7% ELASTANO (Fio Cru + Fio Preto)'
WHERE code = '004';

-- Criar função auxiliar
CREATE OR REPLACE FUNCTION insert_dyeing_cost_safe(p_code text, c_name text, cost_value numeric)
RETURNS void AS $$
DECLARE
  v_product_id uuid;
  v_color_id uuid;
BEGIN
  SELECT id INTO v_product_id FROM products WHERE code = p_code;
  SELECT id INTO v_color_id FROM colors WHERE LOWER(name) = LOWER(c_name) OR LOWER(name) LIKE '%' || LOWER(c_name) || '%' LIMIT 1;
  
  IF v_product_id IS NOT NULL AND v_color_id IS NOT NULL AND cost_value > 0 THEN
    INSERT INTO dyeing_costs (product_id, color_id, cost)
    VALUES (v_product_id, v_color_id, cost_value)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 001-AJ - ROMANTIC LISA (AJ) - ~40 cores com custos corretos
SELECT insert_dyeing_cost_safe('001-AJ', 'BRANCO', 6.81);
SELECT insert_dyeing_cost_safe('001-AJ', 'PRETO', 9.09);
SELECT insert_dyeing_cost_safe('001-AJ', 'ROMANCE', 6.90);
SELECT insert_dyeing_cost_safe('001-AJ', 'FROZEN', 6.90);
SELECT insert_dyeing_cost_safe('001-AJ', 'CHOCOLATE', 6.90);
SELECT insert_dyeing_cost_safe('001-AJ', 'ROYAL', 8.84);
SELECT insert_dyeing_cost_safe('001-AJ', 'BIC', 8.84);
SELECT insert_dyeing_cost_safe('001-AJ', 'JAIPUR', 9.02);
SELECT insert_dyeing_cost_safe('001-AJ', 'FUCSIA', 9.02);
SELECT insert_dyeing_cost_safe('001-AJ', 'PANTERA', 8.63);
SELECT insert_dyeing_cost_safe('001-AJ', 'AÇO', 7.40);
SELECT insert_dyeing_cost_safe('001-AJ', 'VERMELHO', 8.35);
SELECT insert_dyeing_cost_safe('001-AJ', 'MOCASSIM', 7.29);
SELECT insert_dyeing_cost_safe('001-AJ', 'RUBRO', 8.65);
SELECT insert_dyeing_cost_safe('001-AJ', 'PIMENTA', 8.84);
SELECT insert_dyeing_cost_safe('001-AJ', 'TEOS', 6.90);
SELECT insert_dyeing_cost_safe('001-AJ', 'TURQUESA', 9.69);
SELECT insert_dyeing_cost_safe('001-AJ', 'TW', 8.48);
SELECT insert_dyeing_cost_safe('001-AJ', 'FANTÁSTICO', 7.61);
SELECT insert_dyeing_cost_safe('001-AJ', 'TERRA', 8.86);
SELECT insert_dyeing_cost_safe('001-AJ', 'ATALAIA', 8.21);
SELECT insert_dyeing_cost_safe('001-AJ', 'CASTANHO', 7.56);
SELECT insert_dyeing_cost_safe('001-AJ', 'SANDIA', 7.29);
SELECT insert_dyeing_cost_safe('001-AJ', 'ROSA FLUOR', 8.83);
SELECT insert_dyeing_cost_safe('001-AJ', 'AZULEJO', 9.07);
SELECT insert_dyeing_cost_safe('001-AJ', 'ODALÍSCA', 10.82);
SELECT insert_dyeing_cost_safe('001-AJ', 'CHRONOS', 7.40);
SELECT insert_dyeing_cost_safe('001-AJ', 'SANREMO', 7.24);
SELECT insert_dyeing_cost_safe('001-AJ', 'CORAL', 8.37);
SELECT insert_dyeing_cost_safe('001-AJ', 'MARROCOS', 7.45);
SELECT insert_dyeing_cost_safe('001-AJ', 'MASTRUZ', 7.40);

-- 004 - ROMANTIC RAJADO 180G - 17 cores
SELECT insert_dyeing_cost_safe('004', 'BRANCO', 6.29);
SELECT insert_dyeing_cost_safe('004', 'ROMANCE', 6.72);
SELECT insert_dyeing_cost_safe('004', 'FROZEN', 6.54);
SELECT insert_dyeing_cost_safe('004', 'CHOCOLATE', 6.69);
SELECT insert_dyeing_cost_safe('004', 'SATIN', 6.43);
SELECT insert_dyeing_cost_safe('004', 'JAIPUR', 8.19);
SELECT insert_dyeing_cost_safe('004', 'AÇO', 6.89);
SELECT insert_dyeing_cost_safe('004', 'VERMELHO', 6.54);
SELECT insert_dyeing_cost_safe('004', 'RUBRO', 8.09);
SELECT insert_dyeing_cost_safe('004', 'PIMENTA', 9.44);
SELECT insert_dyeing_cost_safe('004', 'TEOS', 6.54);
SELECT insert_dyeing_cost_safe('004', 'BIC', 8.34);
SELECT insert_dyeing_cost_safe('004', 'TW', 7.59);
SELECT insert_dyeing_cost_safe('004', 'MARINHO', 8.69);
SELECT insert_dyeing_cost_safe('004', 'TAME', 10.93);
SELECT insert_dyeing_cost_safe('004', 'TERRA', 7.99);

-- Limpar função
DROP FUNCTION IF EXISTS insert_dyeing_cost_safe;
