-- Primeiro, criar os produtos com variações de fornecedor que faltam
-- 001 - ROMANTIC LISA já existe, mas precisa distinguir fornecedores

-- Adicionar 001 - ROMANTIC LISA (Pedrini) como produto separado
INSERT INTO products (code, name, composition, weight_gsm, width_cm, yield_m_kg, efficiency_factor, weaving_cost, is_active)
VALUES 
  ('001-PEDRINI', '001 - ROMANTIC LISA (Pedrini)', '94% POLIÉSTER - 6% ELASTANO', 180, 165, 3.40, 0.93, 3.75, true),
  ('001-AJ', '001 - ROMANTIC LISA (AJ)', '94% POLIÉSTER - 6% ELASTANO', 180, 165, 3.40, 0.93, 3.75, true),
  ('401-PEDRINI', '401 - MICROFIBRA POLIAMIDA (Pedrini)', '91% POLIAMIDA - 9% ELASTANO', 180, 165, 3.40, 0.91, 4.95, true),
  ('401-AJ', '401 - MICROFIBRA POLIAMIDA (Martextil-AJ)', '91% POLIAMIDA - 9% ELASTANO', 180, 165, 3.40, 0.91, 4.95, true)
ON CONFLICT DO NOTHING;

-- Atualizar produtos existentes com valores corretos
UPDATE products SET efficiency_factor = 0.91, weaving_cost = 3.80 WHERE code = '004';
UPDATE products SET efficiency_factor = 0.91, weaving_cost = 3.80 WHERE code = '004-LIGHT';
UPDATE products SET efficiency_factor = 0.91, weaving_cost = 4.95 WHERE code = '401';
UPDATE products SET efficiency_factor = 0.91, weaving_cost = 3.40 WHERE code IN ('116', '117', '118', '119');

-- Adicionar cores que podem estar faltando
INSERT INTO colors (name, category, scale) VALUES 
  ('LAVAÇÃO', 'Normal', 'Processamento'),
  ('ESTAMPADO', 'Especial', 'Processamento'),
  ('MAJOR', 'Normal', 'Azul'),
  ('BIC IMPERIAL', 'Especial', 'Azul'),
  ('RUBRO IMPERIAL', 'Especial', 'Vermelho'),
  ('TW IMPERIAL', 'Especial', 'Azul'),
  ('CHOCOLATE IMPERIAL', 'Especial', 'Marrom'),
  ('AÇO IMPERIAL', 'Especial', 'Cinza'),
  ('TURQUESA IMPERIAL', 'Especial', 'Azul'),
  ('ERUS IMPERIAL', 'Especial', 'Verde'),
  ('PRETO AMORECO', 'Especial', 'Preto'),
  ('RACY AMORECO', 'Especial', 'Rosa'),
  ('COOFFE FLORATA', 'Especial', 'Marrom'),
  ('PRATA FLORATA', 'Especial', 'Cinza'),
  ('VINHO FLORATA', 'Especial', 'Vermelho'),
  ('AMÊNDOA BRONZE', 'Especial', 'Bege'),
  ('RUBRO RONALDO', 'Especial', 'Vermelho')
ON CONFLICT DO NOTHING;