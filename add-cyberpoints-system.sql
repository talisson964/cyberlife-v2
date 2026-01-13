-- ============================================
-- CYBERLIFE V2 - SISTEMA DE PONTUAÇÃO (CyberPoints)
-- Data: 13 de Janeiro de 2026
-- ============================================
--
-- DESCRIÇÃO DO SISTEMA:
-- - Cada novo perfil começa com 0 CyberPoints
-- - Produtos, banners e eventos podem ter pontos customizados (campo opcional)
-- - Regra padrão: A cada R$ 50 gastos = 30 pontos
-- - Se produto/banner/evento tiver pontos cadastrados, usa esse valor
-- - Histórico completo de ganhos e gastos de pontos
--
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard > SQL Editor
-- 2. Cole e execute este script completo
-- 3. Verifique as tabelas criadas
--
-- ============================================

-- ============================================
-- PASSO 1: ADICIONAR COLUNA DE PONTOS NA TABELA PROFILES
-- ============================================

-- Adicionar campo cyber_points com valor padrão 0
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cyber_points INTEGER DEFAULT 0 CHECK (cyber_points >= 0);

-- Criar índice para melhor performance em consultas
CREATE INDEX IF NOT EXISTS idx_profiles_cyber_points ON public.profiles(cyber_points);

-- Comentário explicativo
COMMENT ON COLUMN public.profiles.cyber_points IS 'Saldo atual de CyberPoints do usuário (pontos de fidelidade)';

-- Atualizar usuários existentes para ter 0 pontos (caso não tenham)
UPDATE public.profiles 
SET cyber_points = 0 
WHERE cyber_points IS NULL;

-- ============================================
-- PASSO 2: ADICIONAR CAMPO DE PONTOS EM PRODUTOS
-- ============================================

-- Adicionar campo opcional de pontos em produtos
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT NULL CHECK (reward_points IS NULL OR reward_points >= 0);

-- Comentário explicativo
COMMENT ON COLUMN public.products.reward_points IS 'Pontos CyberPoints que o cliente ganha ao comprar este produto (NULL = usa regra padrão de R$50 = 30 pontos)';

-- ============================================
-- PASSO 3: ADICIONAR CAMPO DE PONTOS EM BANNERS
-- ============================================

-- Adicionar campo opcional de pontos em banners
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT NULL CHECK (reward_points IS NULL OR reward_points >= 0);

-- Comentário explicativo
COMMENT ON COLUMN public.banners.reward_points IS 'Pontos CyberPoints promocionais do banner (NULL = sem pontos especiais)';

-- ============================================
-- PASSO 4: ADICIONAR CAMPO DE PONTOS EM EVENTOS
-- ============================================

-- Adicionar campo opcional de pontos em eventos
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS reward_points INTEGER DEFAULT NULL CHECK (reward_points IS NULL OR reward_points >= 0);

-- Comentário explicativo
COMMENT ON COLUMN public.events.reward_points IS 'Pontos CyberPoints que o participante ganha ao se inscrever/participar (NULL = sem pontos)';

-- ============================================
-- PASSO 5: CRIAR TABELA DE HISTÓRICO DE PONTOS
-- ============================================

-- Tabela para registrar todas as transações de pontos
CREATE TABLE IF NOT EXISTS public.cyber_points_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'refunded', 'expired', 'bonus', 'adjustment')),
  source TEXT NOT NULL CHECK (source IN ('purchase', 'product', 'event', 'banner', 'promotion', 'referral', 'admin', 'other')),
  description TEXT NOT NULL,
  reference_id BIGINT,
  reference_type TEXT CHECK (reference_type IN ('order', 'product', 'event', 'banner', NULL)),
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_cyber_points_history_user ON public.cyber_points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_cyber_points_history_type ON public.cyber_points_history(type);
CREATE INDEX IF NOT EXISTS idx_cyber_points_history_source ON public.cyber_points_history(source);
CREATE INDEX IF NOT EXISTS idx_cyber_points_history_date ON public.cyber_points_history(created_at);
CREATE INDEX IF NOT EXISTS idx_cyber_points_history_reference ON public.cyber_points_history(reference_id, reference_type);

-- Comentários
COMMENT ON TABLE public.cyber_points_history IS 'Histórico completo de todas as transações de CyberPoints';
COMMENT ON COLUMN public.cyber_points_history.type IS 'Tipo de transação: earned (ganho), spent (gasto), refunded (estornado), expired (expirado), bonus (bônus), adjustment (ajuste manual)';
COMMENT ON COLUMN public.cyber_points_history.source IS 'Origem dos pontos: purchase (compra), product (produto específico), event (evento), banner (promoção banner), etc.';
COMMENT ON COLUMN public.cyber_points_history.reference_id IS 'ID da referência (order_id, product_id, event_id, etc.)';
COMMENT ON COLUMN public.cyber_points_history.balance_before IS 'Saldo de pontos antes da transação';
COMMENT ON COLUMN public.cyber_points_history.balance_after IS 'Saldo de pontos após a transação';

-- ============================================
-- PASSO 6: FUNÇÃO PARA CALCULAR PONTOS DE COMPRA
-- ============================================

-- Função para calcular pontos baseado no valor total
DROP FUNCTION IF EXISTS calculate_purchase_points(DECIMAL) CASCADE;
CREATE OR REPLACE FUNCTION calculate_purchase_points(total_amount DECIMAL)
RETURNS INTEGER AS $$
DECLARE
  points INTEGER;
BEGIN
  -- Regra: A cada R$ 50 gastos, o cliente ganha 30 pontos
  -- Exemplo: R$ 100 = 60 pontos, R$ 75 = 30 pontos, R$ 45 = 0 pontos
  points := FLOOR(total_amount / 50.0) * 30;
  RETURN points;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_purchase_points(DECIMAL) IS 'Calcula pontos baseado no total da compra (regra: R$50 = 30 pontos)';

-- ============================================
-- PASSO 7: FUNÇÃO PARA ADICIONAR PONTOS AO USUÁRIO
-- ============================================

-- Função para adicionar pontos com registro de histórico
DROP FUNCTION IF EXISTS add_cyber_points(UUID, INTEGER, TEXT, TEXT, TEXT, BIGINT, TEXT, UUID) CASCADE;
CREATE OR REPLACE FUNCTION add_cyber_points(
  p_user_id UUID,
  p_points INTEGER,
  p_type TEXT,
  p_source TEXT,
  p_description TEXT,
  p_reference_id BIGINT DEFAULT NULL,
  p_reference_type TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_result JSONB;
BEGIN
  -- Validar tipo e source
  IF p_type NOT IN ('earned', 'spent', 'refunded', 'expired', 'bonus', 'adjustment') THEN
    RAISE EXCEPTION 'Tipo inválido: %. Valores aceitos: earned, spent, refunded, expired, bonus, adjustment', p_type;
  END IF;
  
  IF p_source NOT IN ('purchase', 'product', 'event', 'banner', 'promotion', 'referral', 'admin', 'other') THEN
    RAISE EXCEPTION 'Source inválido: %. Valores aceitos: purchase, product, event, banner, promotion, referral, admin, other', p_source;
  END IF;

  -- Obter saldo atual
  SELECT cyber_points INTO v_balance_before
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_balance_before IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado: %', p_user_id;
  END IF;

  -- Calcular novo saldo
  v_balance_after := v_balance_before + p_points;

  -- Não permitir saldo negativo
  IF v_balance_after < 0 THEN
    RAISE EXCEPTION 'Saldo insuficiente. Saldo atual: %, Tentando usar: %', v_balance_before, ABS(p_points);
  END IF;

  -- Atualizar saldo do usuário
  UPDATE public.profiles
  SET cyber_points = v_balance_after,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Registrar no histórico
  INSERT INTO public.cyber_points_history (
    user_id, points, type, source, description,
    reference_id, reference_type,
    balance_before, balance_after, created_by
  ) VALUES (
    p_user_id, p_points, p_type, p_source, p_description,
    p_reference_id, p_reference_type,
    v_balance_before, v_balance_after, p_created_by
  );

  -- Retornar resultado
  v_result := jsonb_build_object(
    'success', true,
    'user_id', p_user_id,
    'points_changed', p_points,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after,
    'type', p_type,
    'source', p_source
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION add_cyber_points IS 'Adiciona/subtrai pontos do usuário e registra no histórico';

-- ============================================
-- PASSO 8: FUNÇÃO PARA PROCESSAR PONTOS DE PEDIDO
-- ============================================

-- Função para processar pontos quando um pedido é pago
DROP FUNCTION IF EXISTS process_order_points(BIGINT) CASCADE;
CREATE OR REPLACE FUNCTION process_order_points(p_order_id BIGINT)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item JSONB;
  v_product RECORD;
  v_total_points INTEGER := 0;
  v_product_points INTEGER;
  v_purchase_points INTEGER;
  v_result JSONB;
BEGIN
  -- Buscar dados do pedido
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pedido não encontrado: %', p_order_id;
  END IF;

  IF v_order.user_id IS NULL THEN
    RAISE EXCEPTION 'Pedido não possui usuário associado';
  END IF;

  -- Verificar se já processou pontos deste pedido
  IF EXISTS (
    SELECT 1 FROM public.cyber_points_history
    WHERE reference_id = p_order_id
      AND reference_type = 'order'
      AND user_id = v_order.user_id
  ) THEN
    RAISE NOTICE 'Pontos já processados para este pedido';
    RETURN jsonb_build_object('success', false, 'message', 'Pontos já processados anteriormente');
  END IF;

  -- Processar cada item do pedido
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order.items)
  LOOP
    -- Buscar informações do produto
    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item->>'id')::BIGINT;

    IF FOUND THEN
      -- Verificar se produto tem pontos customizados
      IF v_product.reward_points IS NOT NULL THEN
        -- Usar pontos do produto multiplicado pela quantidade
        v_product_points := v_product.reward_points * (v_item->>'quantity')::INTEGER;
        
        -- Adicionar pontos do produto
        PERFORM add_cyber_points(
          v_order.user_id,
          v_product_points,
          'earned',
          'product',
          format('Pontos por compra: %s x%s', v_product.name, v_item->>'quantity'),
          v_product.id,
          'product',
          NULL
        );
        
        v_total_points := v_total_points + v_product_points;
      END IF;
    END IF;
  END LOOP;

  -- Calcular pontos pela regra padrão (R$ 50 = 30 pontos)
  v_purchase_points := calculate_purchase_points(v_order.total);
  
  IF v_purchase_points > 0 THEN
    -- Adicionar pontos da compra
    PERFORM add_cyber_points(
      v_order.user_id,
      v_purchase_points,
      'earned',
      'purchase',
      format('Pontos por compra no valor de R$ %.2f (Pedido #%s)', v_order.total, v_order.order_number),
      p_order_id,
      'order',
      NULL
    );
    
    v_total_points := v_total_points + v_purchase_points;
  END IF;

  -- Retornar resultado
  v_result := jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'order_number', v_order.order_number,
    'total_points_earned', v_total_points,
    'product_points', v_total_points - v_purchase_points,
    'purchase_points', v_purchase_points
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_order_points IS 'Processa e adiciona pontos quando um pedido é marcado como pago';

-- ============================================
-- PASSO 9: TRIGGER PARA PROCESSAR PONTOS AUTOMATICAMENTE
-- ============================================

-- Função do trigger
DROP FUNCTION IF EXISTS auto_process_order_points() CASCADE;
CREATE OR REPLACE FUNCTION auto_process_order_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o status mudou para 'paid'
  IF NEW.payment_status = 'approved' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'approved') THEN
    -- Processar pontos em background (não bloqueia se houver erro)
    BEGIN
      PERFORM process_order_points(NEW.id);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erro ao processar pontos do pedido %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_auto_process_order_points ON public.orders;
CREATE TRIGGER trigger_auto_process_order_points
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_process_order_points();

COMMENT ON FUNCTION auto_process_order_points IS 'Trigger que processa pontos automaticamente quando pedido é aprovado';

-- ============================================
-- PASSO 10: FUNÇÃO PARA PROCESSAR PONTOS DE EVENTOS
-- ============================================

-- Função para adicionar pontos quando usuário se inscreve em evento
DROP FUNCTION IF EXISTS process_event_registration_points(BIGINT) CASCADE;
CREATE OR REPLACE FUNCTION process_event_registration_points(p_registration_id BIGINT)
RETURNS JSONB AS $$
DECLARE
  v_registration RECORD;
  v_event RECORD;
  v_result JSONB;
BEGIN
  -- Buscar dados da inscrição
  SELECT * INTO v_registration
  FROM public.event_registrations
  WHERE id = p_registration_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inscrição não encontrada: %', p_registration_id;
  END IF;

  -- Buscar dados do evento
  SELECT * INTO v_event
  FROM public.events
  WHERE id = v_registration.event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Evento não encontrado: %', v_registration.event_id;
  END IF;

  -- Verificar se evento tem pontos cadastrados
  IF v_event.reward_points IS NULL OR v_event.reward_points = 0 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Evento não oferece pontos');
  END IF;

  -- Verificar se já processou pontos desta inscrição
  IF EXISTS (
    SELECT 1 FROM public.cyber_points_history
    WHERE reference_id = v_registration.event_id
      AND reference_type = 'event'
      AND user_id = v_registration.user_id
  ) THEN
    RAISE NOTICE 'Pontos já processados para esta inscrição';
    RETURN jsonb_build_object('success', false, 'message', 'Pontos já processados anteriormente');
  END IF;

  -- Adicionar pontos do evento
  v_result := add_cyber_points(
    v_registration.user_id,
    v_event.reward_points,
    'earned',
    'event',
    format('Pontos por inscrição no evento: %s', v_event.title),
    v_event.id,
    'event',
    NULL
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION process_event_registration_points IS 'Processa pontos quando usuário se inscreve em um evento';

-- ============================================
-- PASSO 11: TRIGGER PARA EVENTOS
-- ============================================

-- Função do trigger para eventos
DROP FUNCTION IF EXISTS auto_process_event_points() CASCADE;
CREATE OR REPLACE FUNCTION auto_process_event_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se a inscrição foi confirmada
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Processar pontos em background
    BEGIN
      PERFORM process_event_registration_points(NEW.id);
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erro ao processar pontos do evento %: %', NEW.event_id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_auto_process_event_points ON public.event_registrations;
CREATE TRIGGER trigger_auto_process_event_points
  AFTER INSERT OR UPDATE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION auto_process_event_points();

COMMENT ON FUNCTION auto_process_event_points IS 'Trigger que processa pontos automaticamente quando inscrição em evento é confirmada';

-- ============================================
-- PASSO 12: POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS na tabela de histórico de pontos
ALTER TABLE public.cyber_points_history ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seu próprio histórico
DROP POLICY IF EXISTS "Users can view own points history" ON public.cyber_points_history;
CREATE POLICY "Users can view own points history"
  ON public.cyber_points_history FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Admin pode ver todo o histórico
DROP POLICY IF EXISTS "Admin can view all points history" ON public.cyber_points_history;
CREATE POLICY "Admin can view all points history"
  ON public.cyber_points_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Política: Sistema pode inserir registros
DROP POLICY IF EXISTS "System can insert points history" ON public.cyber_points_history;
CREATE POLICY "System can insert points history"
  ON public.cyber_points_history FOR INSERT
  WITH CHECK (true);

-- ============================================
-- PASSO 13: VIEWS ÚTEIS
-- ============================================

-- View: Ranking de usuários por pontos
DROP VIEW IF EXISTS public.cyber_points_ranking CASCADE;
CREATE OR REPLACE VIEW public.cyber_points_ranking AS
SELECT 
  p.id,
  p.nickname,
  p.full_name,
  p.cyber_points,
  p.avatar_url,
  ROW_NUMBER() OVER (ORDER BY p.cyber_points DESC, p.created_at ASC) as rank
FROM public.profiles p
WHERE p.cyber_points > 0
ORDER BY p.cyber_points DESC, p.created_at ASC
LIMIT 100;

COMMENT ON VIEW public.cyber_points_ranking IS 'Top 100 usuários com mais CyberPoints';

-- View: Resumo de pontos do usuário
DROP VIEW IF EXISTS public.user_points_summary CASCADE;
CREATE OR REPLACE VIEW public.user_points_summary AS
SELECT 
  p.id as user_id,
  p.nickname,
  p.cyber_points as current_balance,
  COALESCE(SUM(CASE WHEN h.type = 'earned' THEN h.points ELSE 0 END), 0) as total_earned,
  COALESCE(SUM(CASE WHEN h.type = 'spent' THEN ABS(h.points) ELSE 0 END), 0) as total_spent,
  COUNT(h.id) as total_transactions,
  MAX(h.created_at) as last_activity
FROM public.profiles p
LEFT JOIN public.cyber_points_history h ON h.user_id = p.id
GROUP BY p.id, p.nickname, p.cyber_points;

COMMENT ON VIEW public.user_points_summary IS 'Resumo completo de pontos por usuário';

-- ============================================
-- PASSO 14: FUNÇÕES AUXILIARES
-- ============================================

-- Função para obter saldo de pontos
DROP FUNCTION IF EXISTS get_user_points(UUID) CASCADE;
CREATE OR REPLACE FUNCTION get_user_points(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_points INTEGER;
BEGIN
  SELECT cyber_points INTO v_points
  FROM public.profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_points, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_user_points IS 'Retorna o saldo atual de CyberPoints do usuário';

-- Função para verificar se usuário tem pontos suficientes
DROP FUNCTION IF EXISTS has_enough_points(UUID, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION has_enough_points(p_user_id UUID, p_required_points INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_points(p_user_id) >= p_required_points;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION has_enough_points IS 'Verifica se usuário tem pontos suficientes';

-- ============================================
-- PASSO 15: DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Exemplo: Adicionar pontos manualmente
/*
SELECT add_cyber_points(
  'user-uuid-aqui'::UUID,
  100,
  'bonus',
  'admin',
  'Bônus de boas-vindas',
  NULL,
  NULL,
  'admin-uuid-aqui'::UUID
);
*/

-- Exemplo: Processar pontos de um pedido manualmente
/*
SELECT process_order_points(1);
*/

-- ============================================
-- VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar se coluna foi adicionada em profiles
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
  AND column_name = 'cyber_points';

-- Verificar se colunas foram adicionadas nas outras tabelas
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('products', 'banners', 'events')
  AND column_name = 'reward_points'
ORDER BY table_name;

-- Verificar se tabela de histórico foi criada
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'cyber_points_history') as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'cyber_points_history';

-- Verificar funções criadas
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%points%'
ORDER BY routine_name;

-- Verificar triggers criados
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%points%';

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================

/*
╔═══════════════════════════════════════════════════════════════════════════╗
║                    SISTEMA CYBERPOINTS INSTALADO COM SUCESSO!              ║
╚═══════════════════════════════════════════════════════════════════════════╝

📌 COMO FUNCIONA:

1. NOVOS USUÁRIOS:
   - Automaticamente começam com 0 CyberPoints

2. PRODUTOS:
   - Adicione pontos no campo 'reward_points' ao cadastrar produto
   - Se deixar NULL, usa regra padrão (R$ 50 = 30 pontos)
   - Exemplo: Produto com reward_points = 100 → cliente ganha 100 pontos

3. BANNERS:
   - Campo 'reward_points' para promoções especiais
   - Use para campanhas de pontos em dobro, etc.

4. EVENTOS:
   - Campo 'reward_points' para dar pontos aos participantes
   - Pontos creditados quando inscrição é confirmada

5. COMPRAS:
   - Pontos processados automaticamente quando payment_status = 'approved'
   - Soma pontos dos produtos + pontos pela regra padrão
   - Exemplo: Compra de R$ 150 = 90 pontos padrão + pontos dos produtos

📊 CONSULTAS ÚTEIS:

-- Ver ranking de pontos
SELECT * FROM cyber_points_ranking LIMIT 10;

-- Ver histórico de um usuário
SELECT * FROM cyber_points_history 
WHERE user_id = 'user-uuid' 
ORDER BY created_at DESC;

-- Ver resumo de todos os usuários
SELECT * FROM user_points_summary 
ORDER BY current_balance DESC;

-- Adicionar pontos manualmente (como admin)
SELECT add_cyber_points(
  'user-uuid'::UUID,
  500,  -- quantidade de pontos
  'bonus',  -- tipo
  'promotion',  -- source
  'Promoção especial de aniversário',  -- descrição
  NULL,  -- reference_id
  NULL,  -- reference_type
  auth.uid()  -- admin que está adicionando
);

-- Remover pontos (usar número negativo)
SELECT add_cyber_points(
  'user-uuid'::UUID,
  -100,  -- quantidade negativa
  'spent',
  'other',
  'Pontos gastos em resgate',
  NULL,
  NULL,
  auth.uid()
);

-- Processar pontos de pedido específico
SELECT process_order_points(123);

🎯 PRÓXIMOS PASSOS:

1. Atualizar interface do AdminPanel para incluir campo de pontos
2. Criar tela para usuários visualizarem seus pontos
3. Implementar sistema de resgate de pontos
4. Criar relatórios de pontos no dashboard admin
5. Adicionar notificações quando usuário ganha pontos

💡 DICAS:

- Pontos são creditados apenas quando pagamento é aprovado
- Eventos creditam pontos quando inscrição é confirmada
- Todo histórico é mantido para auditoria
- Saldo nunca pode ficar negativo
- Use a função has_enough_points() antes de permitir resgates

*/

-- ============================================
-- FIM DO SCRIPT
-- ============================================

SELECT 
  '✅ Sistema CyberPoints instalado com sucesso!' as status,
  '🎮 Pronto para gamificar a experiência dos clientes!' as message;
