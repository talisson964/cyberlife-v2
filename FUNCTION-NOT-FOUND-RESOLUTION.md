# Resolução do Problema: Função register_for_event_with_cyberpoints não encontrada

## Problema
Ao tentar se inscrever em um evento, ocorre o erro:
```
Could not find the function public.register_for_event_with_cyberpoints(p_event_id) in the schema cache
```

## Causa
A função `register_for_event_with_cyberpoints` não está presente no banco de dados do Supabase, mesmo estando definida no arquivo de configuração.

## Solução
É necessário executar o script SQL no painel do Supabase para criar a função no banco de dados.

### Passos para resolver:

1. Acesse o painel do Supabase
2. Vá até a seção "SQL Editor"
3. Copie e cole o seguinte script:
```sql
-- Script para criar a função register_for_event_with_cyberpoints no Supabase

-- Primeiro, verifique se a função já existe
DROP FUNCTION IF EXISTS public.register_for_event_with_cyberpoints(BIGINT) CASCADE;

-- Criar função para inscrever usuário em evento com verificação de cyberpoints
CREATE OR REPLACE FUNCTION public.register_for_event_with_cyberpoints(p_event_id BIGINT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_event RECORD;
  v_user_points INTEGER;
  v_result JSONB;
BEGIN
  -- Obter ID do usuário autenticado
  v_user_id := auth.uid();

  -- Verificar se usuário está autenticado
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Buscar dados do evento
  SELECT
    e.id,
    e.title,
    e.inscription_price_cyberpoints,
    e.max_participants,
    e.current_participants,
    COALESCE(e.inscription_price_cyberpoints, 0) as effective_price
  INTO v_event
  FROM public.events e
  WHERE e.id = p_event_id;

  -- Verificar se evento existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Evento não encontrado: %', p_event_id;
  END IF;

  -- Verificar se evento ainda permite inscrições
  IF v_event.max_participants IS NOT NULL AND v_event.current_participants >= v_event.max_participants THEN
    RAISE EXCEPTION 'Evento lotado. Nenhuma vaga disponível.';
  END IF;

  -- Obter saldo atual de cyberpoints do usuário
  SELECT cyber_points INTO v_user_points
  FROM public.profiles
  WHERE id = v_user_id;

  -- Verificar se usuário tem saldo suficiente
  IF v_user_points < v_event.effective_price THEN
    RAISE EXCEPTION 'Saldo de CyberPoints insuficiente. Saldo atual: %, Valor necessário: %',
                   v_user_points, v_event.effective_price;
  END IF;

  -- Iniciar transação para garantir consistência
  BEGIN
    -- Tenta inserir a inscrição
    INSERT INTO public.event_registrations (event_id, user_id, user_nickname, user_email, user_whatsapp, status)
    SELECT
      p_event_id,
      v_user_id,
      p.nickname,
      p.email,
      p.whatsapp,
      'confirmed'
    FROM public.profiles p
    WHERE p.id = v_user_id
    ON CONFLICT (event_id, user_id)
    DO UPDATE SET status = 'confirmed', updated_at = NOW()
    RETURNING *;

    -- Descontar os pontos do usuário
    v_result := add_cyber_points(
      v_user_id,
      -v_event.effective_price,  -- Valor negativo para descontar
      'spent',
      'event',
      format('Pagamento da inscrição no evento: %s', v_event.title),
      p_event_id,
      'event',
      v_user_id
    );

    -- Retornar sucesso
    RETURN jsonb_build_object(
      'success', true,
      'message', format('Inscrição no evento "%s" realizada com sucesso! Custo: %s CyberPoints', v_event.title, v_event.effective_price),
      'event_id', p_event_id,
      'inscription_cost', v_event.effective_price,
      'points_deducted', v_event.effective_price,
      'remaining_points', (v_result->>'balance_after')::INTEGER
    );

  EXCEPTION
    WHEN unique_violation THEN
      -- Se já estiver inscrito, retornar mensagem adequada
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Você já está inscrito neste evento.',
        'already_registered', true
      );
    WHEN OTHERS THEN
      -- Em caso de erro, retornar mensagem de erro
      RAISE EXCEPTION 'Erro ao processar inscrição: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário sobre a função
COMMENT ON FUNCTION public.register_for_event_with_cyberpoints IS 'Função para inscrever usuário em evento com verificação e desconto de cyberpoints';

-- Criar política para permitir que usuários chamem esta função
GRANT EXECUTE ON FUNCTION public.register_for_event_with_cyberpoints(BIGINT) TO authenticated;

-- Verificar se a função foi criada corretamente
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_name = 'register_for_event_with_cyberpoints';
```

4. Execute o script clicando no botão "RUN"

5. Após a execução bem-sucedida, a função estará disponível no banco de dados e o botão "Inscrever-se Agora" funcionará corretamente

## Verificação
Após executar o script, você deve ver um resultado indicando que a função foi criada e listada nas rotinas do banco de dados.

## Nota Importante
Esta função depende da função `add_cyber_points` que faz parte do sistema de CyberPoints. Certifique-se de que o sistema de CyberPoints também esteja configurado corretamente no banco de dados.

## Correção de Erros Comuns
Se encontrar o erro `"column 'updated_at' of relation 'event_registrations' does not exist"`, `"query has no destination for result data"` ou problemas com inscrições duplicadas, utilize a versão atualizada do script EXECUTE-THIS-TO-FIX.SQL que já inclui tratamento para diferentes estruturas de tabela, para o uso correto do RETURNING em instruções INSERT...ON CONFLICT, para evitar inscrições duplicadas e com mensagens personalizadas para melhor experiência do usuário.

## Pop-ups Personalizados
O frontend foi atualizado para exibir as mensagens de inscrição em pop-ups personalizados com design elegante e animações, proporcionando uma melhor experiência ao usuário. As mensagens retornadas pela função SQL são exibidas em componentes de notificação com gradientes, ícones apropriados e opção de fechamento.

## Confirmações Personalizadas
Além disso, as confirmações de inscrição (anteriormente usando `window.confirm`) foram substituídas por modais personalizados com design consistente com o tema do site, oferecendo uma experiência mais integrada e profissional ao usuário. As mensagens de confirmação foram aprimoradas com melhor espaçamento, tipografia e elementos visuais para facilitar a leitura e compreensão.