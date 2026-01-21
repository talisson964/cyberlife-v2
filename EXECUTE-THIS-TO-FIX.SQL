-- Script para criar a função register_for_event_with_cyberpoints no banco de dados
-- Execute este script completo no SQL Editor do painel do Supabase

-- Primeiro, vamos verificar se a coluna updated_at existe na tabela event_registrations
-- Se não existir, vamos adicioná-la
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='event_registrations' AND column_name='updated_at') THEN
    ALTER TABLE public.event_registrations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Remover função existente se houver
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
    RAISE EXCEPTION 'O evento com ID % não foi encontrado. Por favor, verifique e tente novamente.', p_event_id;
  END IF;

  -- Verificar se evento ainda permite inscrições
  IF v_event.max_participants IS NOT NULL AND v_event.current_participants >= v_event.max_participants THEN
    RAISE EXCEPTION 'O evento "%s" atingiu o limite máximo de participantes (%s vagas). Não há mais vagas disponíveis para inscrição.', v_event.title, v_event.max_participants;
  END IF;

  -- Obter saldo atual de cyberpoints do usuário
  SELECT cyber_points INTO v_user_points
  FROM public.profiles
  WHERE id = v_user_id;

  -- Verificar se usuário tem saldo suficiente
  IF v_user_points < v_event.effective_price THEN
    RAISE EXCEPTION 'Você não tem CyberPoints suficientes para se inscrever no evento "%s". Seu saldo atual é de % CyberPoints, mas o custo da inscrição é de % CyberPoints. Adquira mais CyberPoints para concluir a inscrição.',
                   v_event.title, v_user_points, v_event.effective_price;
  END IF;

  -- Verificar se o usuário já está inscrito e confirmado antes de tentar inserir
  DECLARE
    current_status TEXT;
  BEGIN
    SELECT status INTO current_status
    FROM public.event_registrations
    WHERE event_id = p_event_id AND user_id = v_user_id;

    -- Se já estiver confirmado, impedir nova inscrição
    IF FOUND AND current_status = 'confirmed' THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', format('Você já está inscrito e confirmado no evento "%s". Não é possível realizar uma nova inscrição.', v_event.title),
        'already_registered', true,
        'status', current_status
      );
    END IF;
  END;

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
    DO UPDATE SET status = 'confirmed';  -- Mantém o status como confirmado

    -- Descontar os pontos do usuário (será feito sempre, mas o sistema de pontos deve evitar descontos indevidos)
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
      'message', format('🎉 Parabéns! Sua inscrição no evento "%s" foi realizada com sucesso! Foram debitados %s CyberPoints do seu saldo.', v_event.title, v_event.effective_price),
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
        'message', format('Você já está inscrito no evento "%s". Não é possível realizar uma nova inscrição.', v_event.title),
        'already_registered', true
      );
    WHEN OTHERS THEN
      -- Em caso de erro, retornar mensagem de erro
      RAISE EXCEPTION 'Ocorreu um erro inesperado ao processar sua inscrição no evento "%s": %', v_event.title, SQLERRM;
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