
-- Deletar todos os custos de tingimento incorretos dos artigos 401
DELETE FROM dyeing_costs WHERE product_id IN (
  SELECT id FROM products WHERE code IN ('401-AJ', '401-PEDRINI', '401-LIGHT', '401-MAX', '401')
);

-- Criar função auxiliar para inserir custos
CREATE OR REPLACE FUNCTION insert_401_dyeing_cost(p_code text, c_name text, cost_value numeric)
RETURNS void AS $$
DECLARE
  v_product_id uuid;
  v_color_id uuid;
BEGIN
  SELECT id INTO v_product_id FROM products WHERE code = p_code;
  SELECT id INTO v_color_id FROM colors WHERE LOWER(TRIM(name)) = LOWER(TRIM(c_name)) 
    OR LOWER(TRIM(name)) LIKE '%' || LOWER(TRIM(c_name)) || '%' LIMIT 1;
  
  IF v_product_id IS NOT NULL AND v_color_id IS NOT NULL AND cost_value > 0 THEN
    INSERT INTO dyeing_costs (product_id, color_id, cost)
    VALUES (v_product_id, v_color_id, cost_value)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Inserir custos corretos para 401-AJ (55 cores)
SELECT insert_401_dyeing_cost('401-AJ', 'TIBETON', 9.49);
SELECT insert_401_dyeing_cost('401-AJ', 'BRANCO', 7.69);
SELECT insert_401_dyeing_cost('401-AJ', 'PRETO', 10.09);
SELECT insert_401_dyeing_cost('401-AJ', 'ROMANCE', 9.09);
SELECT insert_401_dyeing_cost('401-AJ', 'FROZEN', 9.19);
SELECT insert_401_dyeing_cost('401-AJ', 'CHOCOLATE', 8.89);
SELECT insert_401_dyeing_cost('401-AJ', 'SATIN', 9.19);
SELECT insert_401_dyeing_cost('401-AJ', 'SANDIA', 9.29);
SELECT insert_401_dyeing_cost('401-AJ', 'JAIPUR', 10.99);
SELECT insert_401_dyeing_cost('401-AJ', 'RACY', 10.49);
SELECT insert_401_dyeing_cost('401-AJ', 'FRUTILY', 9.79);
SELECT insert_401_dyeing_cost('401-AJ', 'AÇO', 9.54);
SELECT insert_401_dyeing_cost('401-AJ', 'VERMELHO', 11.19);
SELECT insert_401_dyeing_cost('401-AJ', 'MOCASSIM', 9.09);
SELECT insert_401_dyeing_cost('401-AJ', 'RUBRO', 10.54);
SELECT insert_401_dyeing_cost('401-AJ', 'PIMENTA', 11.79);
SELECT insert_401_dyeing_cost('401-AJ', 'TEOS', 9.19);
SELECT insert_401_dyeing_cost('401-AJ', 'BIC', 11.39);
SELECT insert_401_dyeing_cost('401-AJ', 'TAME', 9.09);
SELECT insert_401_dyeing_cost('401-AJ', 'TW', 12.29);
SELECT insert_401_dyeing_cost('401-AJ', 'FANTÁSTICO', 9.19);
SELECT insert_401_dyeing_cost('401-AJ', 'MARINHO', 11.49);
SELECT insert_401_dyeing_cost('401-AJ', 'TERRA', 10.89);
SELECT insert_401_dyeing_cost('401-AJ', 'ATALAIA', 10.48);
SELECT insert_401_dyeing_cost('401-AJ', 'CASTANHO', 9.79);
SELECT insert_401_dyeing_cost('401-AJ', 'MARROCOS', 9.09);
SELECT insert_401_dyeing_cost('401-AJ', 'BISCOITO', 8.89);
SELECT insert_401_dyeing_cost('401-AJ', 'ODALÍSCA', 11.19);
SELECT insert_401_dyeing_cost('401-AJ', 'AZULEJO', 10.19);
SELECT insert_401_dyeing_cost('401-AJ', 'SANREMO', 9.29);
SELECT insert_401_dyeing_cost('401-AJ', 'LOTERIA', 12.19);
SELECT insert_401_dyeing_cost('401-AJ', 'TURQUESA', 11.54);
SELECT insert_401_dyeing_cost('401-AJ', 'CHRONOS', 9.39);
SELECT insert_401_dyeing_cost('401-AJ', 'PANTERA', 9.22);
SELECT insert_401_dyeing_cost('401-AJ', 'CORAL', 9.19);
SELECT insert_401_dyeing_cost('401-AJ', 'HERANÇA', 11.09);
SELECT insert_401_dyeing_cost('401-AJ', 'ROSA BB', 8.79);
SELECT insert_401_dyeing_cost('401-AJ', 'ROYAL', 11.19);
SELECT insert_401_dyeing_cost('401-AJ', 'EROS', 9.29);
SELECT insert_401_dyeing_cost('401-AJ', 'FLORESTA', 11.29);
SELECT insert_401_dyeing_cost('401-AJ', 'PETRÓLEO', 12.29);
SELECT insert_401_dyeing_cost('401-AJ', 'LIPSTICK', 12.05);
SELECT insert_401_dyeing_cost('401-AJ', 'MAJOR', 11.28);
SELECT insert_401_dyeing_cost('401-AJ', 'AMÊNDOA', 9.64);
SELECT insert_401_dyeing_cost('401-AJ', 'MOCHA MOUSSE', 9.84);
SELECT insert_401_dyeing_cost('401-AJ', 'AMÊNDOA BRONZE', 11.53);
SELECT insert_401_dyeing_cost('401-AJ', 'VERDE OLIVA', 9.85);
SELECT insert_401_dyeing_cost('401-AJ', 'COOFFE FLORATA', 12.62);
SELECT insert_401_dyeing_cost('401-AJ', 'COOFFE', 14.46);
SELECT insert_401_dyeing_cost('401-AJ', 'PRATA FLORATA', 9.48);
SELECT insert_401_dyeing_cost('401-AJ', 'VINHO FLORATA', 12.93);
SELECT insert_401_dyeing_cost('401-AJ', 'FUCSIA', 10.99);

-- Inserir custos corretos para 401-PEDRINI (mesmos custos)
SELECT insert_401_dyeing_cost('401-PEDRINI', 'TIBETON', 9.49);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'BRANCO', 7.69);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'PRETO', 10.09);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'ROMANCE', 9.09);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'FROZEN', 9.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'CHOCOLATE', 8.89);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'SATIN', 9.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'SANDIA', 9.29);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'JAIPUR', 10.99);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'RACY', 10.49);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'FRUTILY', 9.79);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'AÇO', 9.54);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'VERMELHO', 11.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'MOCASSIM', 9.09);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'RUBRO', 10.54);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'PIMENTA', 11.79);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'TEOS', 9.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'BIC', 11.39);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'TAME', 9.09);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'TW', 12.29);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'FANTÁSTICO', 9.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'MARINHO', 11.49);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'TERRA', 10.89);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'ATALAIA', 10.48);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'CASTANHO', 9.79);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'MARROCOS', 9.09);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'BISCOITO', 8.89);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'ODALÍSCA', 11.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'AZULEJO', 10.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'SANREMO', 9.29);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'LOTERIA', 12.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'TURQUESA', 11.54);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'CHRONOS', 9.39);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'PANTERA', 9.22);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'CORAL', 9.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'HERANÇA', 11.09);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'ROSA BB', 8.79);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'ROYAL', 11.19);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'EROS', 9.29);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'FLORESTA', 11.29);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'PETRÓLEO', 12.29);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'LIPSTICK', 12.05);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'MAJOR', 11.28);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'AMÊNDOA', 9.64);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'MOCHA MOUSSE', 9.84);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'AMÊNDOA BRONZE', 11.53);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'VERDE OLIVA', 9.85);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'COOFFE FLORATA', 12.62);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'COOFFE', 14.46);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'PRATA FLORATA', 9.48);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'VINHO FLORATA', 12.93);
SELECT insert_401_dyeing_cost('401-PEDRINI', 'FUCSIA', 10.99);

-- Inserir custos corretos para 401-LIGHT (mesmos custos)
SELECT insert_401_dyeing_cost('401-LIGHT', 'TIBETON', 9.49);
SELECT insert_401_dyeing_cost('401-LIGHT', 'BRANCO', 7.69);
SELECT insert_401_dyeing_cost('401-LIGHT', 'PRETO', 10.09);
SELECT insert_401_dyeing_cost('401-LIGHT', 'ROMANCE', 9.09);
SELECT insert_401_dyeing_cost('401-LIGHT', 'FROZEN', 9.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'CHOCOLATE', 8.89);
SELECT insert_401_dyeing_cost('401-LIGHT', 'SATIN', 9.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'SANDIA', 9.29);
SELECT insert_401_dyeing_cost('401-LIGHT', 'JAIPUR', 10.99);
SELECT insert_401_dyeing_cost('401-LIGHT', 'RACY', 10.49);
SELECT insert_401_dyeing_cost('401-LIGHT', 'FRUTILY', 9.79);
SELECT insert_401_dyeing_cost('401-LIGHT', 'AÇO', 9.54);
SELECT insert_401_dyeing_cost('401-LIGHT', 'VERMELHO', 11.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'MOCASSIM', 9.09);
SELECT insert_401_dyeing_cost('401-LIGHT', 'RUBRO', 10.54);
SELECT insert_401_dyeing_cost('401-LIGHT', 'PIMENTA', 11.79);
SELECT insert_401_dyeing_cost('401-LIGHT', 'TEOS', 9.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'BIC', 11.39);
SELECT insert_401_dyeing_cost('401-LIGHT', 'TAME', 9.09);
SELECT insert_401_dyeing_cost('401-LIGHT', 'TW', 12.29);
SELECT insert_401_dyeing_cost('401-LIGHT', 'FANTÁSTICO', 9.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'MARINHO', 11.49);
SELECT insert_401_dyeing_cost('401-LIGHT', 'TERRA', 10.89);
SELECT insert_401_dyeing_cost('401-LIGHT', 'ATALAIA', 10.48);
SELECT insert_401_dyeing_cost('401-LIGHT', 'CASTANHO', 9.79);
SELECT insert_401_dyeing_cost('401-LIGHT', 'MARROCOS', 9.09);
SELECT insert_401_dyeing_cost('401-LIGHT', 'BISCOITO', 8.89);
SELECT insert_401_dyeing_cost('401-LIGHT', 'ODALÍSCA', 11.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'AZULEJO', 10.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'SANREMO', 9.29);
SELECT insert_401_dyeing_cost('401-LIGHT', 'LOTERIA', 12.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'TURQUESA', 11.54);
SELECT insert_401_dyeing_cost('401-LIGHT', 'CHRONOS', 9.39);
SELECT insert_401_dyeing_cost('401-LIGHT', 'PANTERA', 9.22);
SELECT insert_401_dyeing_cost('401-LIGHT', 'CORAL', 9.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'HERANÇA', 11.09);
SELECT insert_401_dyeing_cost('401-LIGHT', 'ROSA BB', 8.79);
SELECT insert_401_dyeing_cost('401-LIGHT', 'ROYAL', 11.19);
SELECT insert_401_dyeing_cost('401-LIGHT', 'EROS', 9.29);
SELECT insert_401_dyeing_cost('401-LIGHT', 'FLORESTA', 11.29);
SELECT insert_401_dyeing_cost('401-LIGHT', 'PETRÓLEO', 12.29);
SELECT insert_401_dyeing_cost('401-LIGHT', 'LIPSTICK', 12.05);
SELECT insert_401_dyeing_cost('401-LIGHT', 'MAJOR', 11.28);
SELECT insert_401_dyeing_cost('401-LIGHT', 'AMÊNDOA', 9.64);
SELECT insert_401_dyeing_cost('401-LIGHT', 'MOCHA MOUSSE', 9.84);
SELECT insert_401_dyeing_cost('401-LIGHT', 'AMÊNDOA BRONZE', 11.53);
SELECT insert_401_dyeing_cost('401-LIGHT', 'VERDE OLIVA', 9.85);
SELECT insert_401_dyeing_cost('401-LIGHT', 'COOFFE FLORATA', 12.62);
SELECT insert_401_dyeing_cost('401-LIGHT', 'COOFFE', 14.46);
SELECT insert_401_dyeing_cost('401-LIGHT', 'PRATA FLORATA', 9.48);
SELECT insert_401_dyeing_cost('401-LIGHT', 'VINHO FLORATA', 12.93);
SELECT insert_401_dyeing_cost('401-LIGHT', 'FUCSIA', 10.99);

-- Inserir custos corretos para 401-MAX (mesmos custos)
SELECT insert_401_dyeing_cost('401-MAX', 'TIBETON', 9.49);
SELECT insert_401_dyeing_cost('401-MAX', 'BRANCO', 7.69);
SELECT insert_401_dyeing_cost('401-MAX', 'PRETO', 10.09);
SELECT insert_401_dyeing_cost('401-MAX', 'ROMANCE', 9.09);
SELECT insert_401_dyeing_cost('401-MAX', 'FROZEN', 9.19);
SELECT insert_401_dyeing_cost('401-MAX', 'CHOCOLATE', 8.89);
SELECT insert_401_dyeing_cost('401-MAX', 'SATIN', 9.19);
SELECT insert_401_dyeing_cost('401-MAX', 'SANDIA', 9.29);
SELECT insert_401_dyeing_cost('401-MAX', 'JAIPUR', 10.99);
SELECT insert_401_dyeing_cost('401-MAX', 'RACY', 10.49);
SELECT insert_401_dyeing_cost('401-MAX', 'FRUTILY', 9.79);
SELECT insert_401_dyeing_cost('401-MAX', 'AÇO', 9.54);
SELECT insert_401_dyeing_cost('401-MAX', 'VERMELHO', 11.19);
SELECT insert_401_dyeing_cost('401-MAX', 'MOCASSIM', 9.09);
SELECT insert_401_dyeing_cost('401-MAX', 'RUBRO', 10.54);
SELECT insert_401_dyeing_cost('401-MAX', 'PIMENTA', 11.79);
SELECT insert_401_dyeing_cost('401-MAX', 'TEOS', 9.19);
SELECT insert_401_dyeing_cost('401-MAX', 'BIC', 11.39);
SELECT insert_401_dyeing_cost('401-MAX', 'TAME', 9.09);
SELECT insert_401_dyeing_cost('401-MAX', 'TW', 12.29);
SELECT insert_401_dyeing_cost('401-MAX', 'FANTÁSTICO', 9.19);
SELECT insert_401_dyeing_cost('401-MAX', 'MARINHO', 11.49);
SELECT insert_401_dyeing_cost('401-MAX', 'TERRA', 10.89);
SELECT insert_401_dyeing_cost('401-MAX', 'ATALAIA', 10.48);
SELECT insert_401_dyeing_cost('401-MAX', 'CASTANHO', 9.79);
SELECT insert_401_dyeing_cost('401-MAX', 'MARROCOS', 9.09);
SELECT insert_401_dyeing_cost('401-MAX', 'BISCOITO', 8.89);
SELECT insert_401_dyeing_cost('401-MAX', 'ODALÍSCA', 11.19);
SELECT insert_401_dyeing_cost('401-MAX', 'AZULEJO', 10.19);
SELECT insert_401_dyeing_cost('401-MAX', 'SANREMO', 9.29);
SELECT insert_401_dyeing_cost('401-MAX', 'LOTERIA', 12.19);
SELECT insert_401_dyeing_cost('401-MAX', 'TURQUESA', 11.54);
SELECT insert_401_dyeing_cost('401-MAX', 'CHRONOS', 9.39);
SELECT insert_401_dyeing_cost('401-MAX', 'PANTERA', 9.22);
SELECT insert_401_dyeing_cost('401-MAX', 'CORAL', 9.19);
SELECT insert_401_dyeing_cost('401-MAX', 'HERANÇA', 11.09);
SELECT insert_401_dyeing_cost('401-MAX', 'ROSA BB', 8.79);
SELECT insert_401_dyeing_cost('401-MAX', 'ROYAL', 11.19);
SELECT insert_401_dyeing_cost('401-MAX', 'EROS', 9.29);
SELECT insert_401_dyeing_cost('401-MAX', 'FLORESTA', 11.29);
SELECT insert_401_dyeing_cost('401-MAX', 'PETRÓLEO', 12.29);
SELECT insert_401_dyeing_cost('401-MAX', 'LIPSTICK', 12.05);
SELECT insert_401_dyeing_cost('401-MAX', 'MAJOR', 11.28);
SELECT insert_401_dyeing_cost('401-MAX', 'AMÊNDOA', 9.64);
SELECT insert_401_dyeing_cost('401-MAX', 'MOCHA MOUSSE', 9.84);
SELECT insert_401_dyeing_cost('401-MAX', 'AMÊNDOA BRONZE', 11.53);
SELECT insert_401_dyeing_cost('401-MAX', 'VERDE OLIVA', 9.85);
SELECT insert_401_dyeing_cost('401-MAX', 'COOFFE FLORATA', 12.62);
SELECT insert_401_dyeing_cost('401-MAX', 'COOFFE', 14.46);
SELECT insert_401_dyeing_cost('401-MAX', 'PRATA FLORATA', 9.48);
SELECT insert_401_dyeing_cost('401-MAX', 'VINHO FLORATA', 12.93);
SELECT insert_401_dyeing_cost('401-MAX', 'FUCSIA', 10.99);

-- Limpar função
DROP FUNCTION IF EXISTS insert_401_dyeing_cost;
