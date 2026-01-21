-- Script de teste para a função de inscrição em eventos com cyberpoints
-- ATENÇÃO: Execute primeiro o script EXECUTE-THIS-TO-FIX.SQL no painel do Supabase

-- Teste 1: Verificar se a função existe após execução do script de criação
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_name = 'register_for_event_with_cyberpoints';

-- Teste 2: Simular uma inscrição em evento com cyberpoints (após criar a função)
-- Este teste deve ser executado com um usuário autenticado

-- Primeiro, vamos verificar se temos eventos com preço de inscrição em cyberpoints
SELECT 
  id, 
  title, 
  inscription_price_cyberpoints,
  current_participants,
  max_participants
FROM events 
WHERE inscription_price_cyberpoints IS NOT NULL 
  AND inscription_price_cyberpoints > 0
  AND active = true
LIMIT 5;

-- Teste 3: Verificar o saldo de cyberpoints de um usuário
-- Substitua 'USER_ID_AQUI' pelo ID real do usuário
/*
SELECT 
  nickname,
  cyber_points
FROM profiles 
WHERE id = 'USER_ID_AQUI';
*/

-- Teste 4: Exemplo de chamada à função (isso seria feito no frontend via Supabase RPC)
-- SELECT register_for_event_with_cyberpoints(EVENT_ID_AQUI);

-- Teste 5: Verificar histórico de pontos após inscrição
/*
SELECT 
  type,
  source,
  description,
  points,
  balance_before,
  balance_after,
  created_at
FROM cyber_points_history
WHERE user_id = 'USER_ID_AQUI'
  AND source = 'event'
ORDER BY created_at DESC
LIMIT 10;
*/

-- Teste 6: Verificar inscrições em eventos
/*
SELECT 
  er.id,
  e.title,
  er.status,
  er.created_at
FROM event_registrations er
JOIN events e ON e.id = er.event_id
WHERE er.user_id = 'USER_ID_AQUI'
ORDER BY er.created_at DESC;
*/

-- =============================================================================
-- INSTRUÇÕES PARA RESOLUÇÃO DO PROBLEMA
-- =============================================================================

/*
PASSO A PASSO PARA FAZER FUNCIONAR:

1. Acesse o painel do Supabase
2. Vá até a seção "SQL Editor"
3. Copie e cole o conteúdo do arquivo EXECUTE-THIS-TO-FIX.SQL
4. Execute o script clicando no botão "RUN"
5. Após a execução bem-sucedida, a função estará disponível no banco de dados
6. O botão "Inscrever-se Agora" na página de eventos funcionará corretamente

A função fará o seguinte:
- Verificará se o usuário está logado
- Verificará se o evento existe e tem vagas
- Verificará se o usuário tem saldo suficiente de cyberpoints
- Mostrará o valor da inscrição na mensagem de confirmação
- Confirmará a inscrição e descontará os pontos se tudo estiver OK
- Retornará mensagens claras de sucesso ou erro
*/

-- =============================================================================
-- CONSULTAS ÚTEIS PARA VERIFICAÇÃO
-- =============================================================================

-- Verificar se a função foi criada corretamente
SELECT routine_name, routine_type, data_type
FROM information_schema.routines
WHERE routine_name = 'register_for_event_with_cyberpoints';

-- Verificar se a função está no esquema público
SELECT n.nspname as schema_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'register_for_event_with_cyberpoints';

-- Verificar permissões da função
SELECT grantee, privilege_type
FROM information_schema.routine_privileges
WHERE specific_name = 'register_for_event_with_cyberpoints(bigint)';

-- =============================================================================
-- CORREÇÃO DE ERROS COMUNS
-- =============================================================================

/*
Se ocorrer o erro: "column 'updated_at' of relation 'event_registrations' does not exist"
Execute esta query antes de executar a função:

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='event_registrations' AND column_name='updated_at') THEN
    ALTER TABLE public.event_registrations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

Ou utilize a versão atualizada do script EXECUTE-THIS-TO-FIX.SQL que já inclui esta verificação.

Se ocorrer o erro: "query has no destination for result data"
Utilize a versão atualizada do script EXECUTE-THIS-TO-FIX.SQL que corrige o uso do RETURNING em instruções INSERT...ON CONFLICT.
*/