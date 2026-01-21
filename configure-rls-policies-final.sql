-- Script para configurar as políticas de RLS (Row Level Security) no Supabase
-- Permite que todos os administradores visualizem todos os perfis de usuários
-- Inclui políticas para inscrição em eventos com verificação de cyberpoints

-- Primeiro, remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam seus próprios perfis
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Política para permitir que administradores vejam todos os perfis
CREATE POLICY "Admin can view all profiles" ON profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles AS current_user_profile
    WHERE current_user_profile.id = auth.uid()
    AND current_user_profile.is_admin = true
  )
);

-- Política para permitir que administradores atualizem perfis
CREATE POLICY "Admin can update profiles" ON profiles
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles AS current_user_profile
    WHERE current_user_profile.id = auth.uid()
    AND current_user_profile.is_admin = true
  )
);

-- Política para permitir que administradores excluam perfis
CREATE POLICY "Admin can delete profiles" ON profiles
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles AS current_user_profile
    WHERE current_user_profile.id = auth.uid()
    AND current_user_profile.is_admin = true
  )
);

-- Política para permitir que usuários atualizem seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Política para permitir que usuários insiram seu próprio perfil (trigger)
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Política para permitir que administradores insiram perfis
CREATE POLICY "Admin can insert profiles" ON profiles
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles AS current_user_profile
    WHERE current_user_profile.id = auth.uid()
    AND current_user_profile.is_admin = true
  )
);

-- Função para inscrever usuário em evento com verificação e desconto de cyberpoints
-- Esta função verifica se o usuário tem saldo suficiente e realiza a inscrição com desconto de pontos

-- Remover função existente se houver
DROP FUNCTION IF EXISTS register_for_event_with_cyberpoints(BIGINT) CASCADE;

-- Criar função para inscrever usuário em evento com verificação de cyberpoints
CREATE OR REPLACE FUNCTION register_for_event_with_cyberpoints(p_event_id BIGINT)
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
COMMENT ON FUNCTION register_for_event_with_cyberpoints IS 'Função para inscrever usuário em evento com verificação e desconto de cyberpoints';

-- Criar política para permitir que usuários chamem esta função
GRANT EXECUTE ON FUNCTION register_for_event_with_cyberpoints(BIGINT) TO authenticated;