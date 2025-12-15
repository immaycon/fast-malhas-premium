-- First delete dyeing_costs entries that use the duplicate color IDs
-- (keeping the entries that use the canonical color IDs)

-- 1. PETROLEO (duplicate) - delete its dyeing_costs
DELETE FROM dyeing_costs WHERE color_id = 'c4bf05dc-bd33-4a3d-bb83-fa4b3c9d1ff2';
DELETE FROM colors WHERE id = 'c4bf05dc-bd33-4a3d-bb83-fa4b3c9d1ff2';

-- 2. PRETO (AMORECO) (duplicate) - delete its dyeing_costs
DELETE FROM dyeing_costs WHERE color_id = '364ab420-8b6b-4304-8823-619c11a5a478';
DELETE FROM colors WHERE id = '364ab420-8b6b-4304-8823-619c11a5a478';

-- 3. RACY/PINK (duplicate) - delete its dyeing_costs
DELETE FROM dyeing_costs WHERE color_id = '1562aabc-edb9-4b5e-a600-0f6502d60ab2';
DELETE FROM colors WHERE id = '1562aabc-edb9-4b5e-a600-0f6502d60ab2';

-- 4. RACY/PINK (AMORECO) (duplicate) - delete its dyeing_costs
DELETE FROM dyeing_costs WHERE color_id = 'aa081e93-2a42-40d8-8693-52f05ee88eb7';
DELETE FROM colors WHERE id = 'aa081e93-2a42-40d8-8693-52f05ee88eb7';

-- 5. VERDE OLIVA(FLORATA) (duplicate) - delete its dyeing_costs
DELETE FROM dyeing_costs WHERE color_id = '78fb9ea3-14f1-4822-b5bb-0ec4e805ebca';
DELETE FROM colors WHERE id = '78fb9ea3-14f1-4822-b5bb-0ec4e805ebca';

-- 6. ROSA BB (BR ACESSÓRIOS) (duplicate) - delete its dyeing_costs
DELETE FROM dyeing_costs WHERE color_id = '1cf57d4b-40a4-48ab-b47a-cf34397d278d';
DELETE FROM colors WHERE id = '1cf57d4b-40a4-48ab-b47a-cf34397d278d';

-- 7. RUBRO (RONALDO) (duplicate) - delete its dyeing_costs
DELETE FROM dyeing_costs WHERE color_id = 'e8366a2e-7422-4928-9b01-bd5d5aac8309';
DELETE FROM colors WHERE id = 'e8366a2e-7422-4928-9b01-bd5d5aac8309';