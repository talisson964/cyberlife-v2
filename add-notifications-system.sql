-- SISTEMA DE NOTIFICAÇÕES
-- Criar tabela de notificações para usuários

-- 1. Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'points', 'purchase', 'event', 'bonus', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT '🔔',
  points INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- 3. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS - usuários podem ver apenas suas próprias notificações
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_delete_own"
ON notifications FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 5. Função para criar notificação automaticamente ao ganhar pontos
CREATE OR REPLACE FUNCTION create_points_notification()
RETURNS TRIGGER AS $$
DECLARE
  points_emoji VARCHAR(10);
BEGIN
  -- Escolher emoji baseado no tipo
  CASE NEW.type
    WHEN 'purchase' THEN points_emoji := '🛒';
    WHEN 'event' THEN points_emoji := '🎉';
    WHEN 'bonus' THEN points_emoji := '🎁';
    ELSE points_emoji := '⭐';
  END CASE;

  -- Criar notificação
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    icon,
    points
  ) VALUES (
    NEW.user_id,
    'points',
    'CyberPoints Ganhos!',
    NEW.description || ' - +' || NEW.points || ' pontos',
    points_emoji,
    NEW.points
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger para criar notificação ao adicionar pontos
DROP TRIGGER IF EXISTS trigger_points_notification ON cyber_points_history;
CREATE TRIGGER trigger_points_notification
  AFTER INSERT ON cyber_points_history
  FOR EACH ROW
  EXECUTE FUNCTION create_points_notification();

-- 7. Função para criar notificação de compra
CREATE OR REPLACE FUNCTION create_purchase_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar notificação quando status muda para 'approved'
  IF NEW.payment_status = 'approved' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'approved') THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      icon,
      points
    ) VALUES (
      NEW.user_id,
      'purchase',
      'Compra Confirmada!',
      'Seu pedido foi confirmado. Total: R$ ' || NEW.total_amount::TEXT,
      '✅',
      0
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para notificação de compra (se a tabela orders existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    DROP TRIGGER IF EXISTS trigger_purchase_notification ON orders;
    CREATE TRIGGER trigger_purchase_notification
      AFTER INSERT OR UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION create_purchase_notification();
  END IF;
END $$;

-- 9. Verificar tabelas criadas
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;
