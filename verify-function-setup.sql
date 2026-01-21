-- Script para verificar e corrigir a função register_for_event_with_cyberpoints

-- Verificar se a função existe
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_name = 'register_for_event_with_cyberpoints';

-- Verificar os parâmetros da função
SELECT parameter_name, data_type, parameter_mode
FROM information_schema.parameters
WHERE specific_name LIKE 'register_for_event_with_cyberpoints%';

-- Verificar se a função está definida corretamente no esquema público
SELECT proname, probin, proconfig 
FROM pg_proc 
WHERE proname = 'register_for_event_with_cyberpoints';

-- Se a função não existir ou estiver incorreta, recriar com o nome exato usado no frontend
-- A função já está definida corretamente no arquivo configure-rls-policies-final.sql
-- mas vamos garantir que ela está funcionando com o nome certo

-- A função deve ser chamada como: register_for_event_with_cyberpoints(p_event_id)
-- que corresponde ao nome no frontend

-- Teste de exemplo (descomente para usar, substituindo EVENT_ID pelo ID real de um evento)
-- IMPORTANTE: Execute isso apenas após garantir que a função está no banco de dados
/*
SELECT register_for_event_with_cyberpoints(1);
*/

-- Consulta para verificar se a função add_cyber_points existe (necessária para a função funcionar)
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'add_cyber_points';