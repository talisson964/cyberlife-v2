-- SISTEMA DE INSÍGNIAS
-- Criar tabela de insígnias para usuários

-- 1. Criar tabela de insígnias
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🏆',
  image_url TEXT, -- URL da imagem da insígnia
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')), -- raridade da insígnia
  points_required INTEGER DEFAULT 0, -- pontos necessários para ganhar a insígnia
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar constraint UNIQUE para o nome da insígnia
ALTER TABLE badges ADD CONSTRAINT badges_name_unique UNIQUE (name);

-- 2. Criar tabela de insígnias dos usuários (relacionamento N:N)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id) -- evitar duplicatas
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_badges_name ON badges(name);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);
CREATE INDEX IF NOT EXISTS idx_badges_active ON badges(active);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_acquired_at ON user_badges(acquired_at);

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para insígnias
CREATE POLICY "badges_public_select" ON badges FOR SELECT
TO authenticated, anon
USING (active = true);

CREATE POLICY "badges_admin_manage" ON badges FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. Políticas RLS para insígnias dos usuários
CREATE POLICY "user_badges_select_own" ON user_badges FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "user_badges_insert_own" ON user_badges FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_badges_update_own" ON user_badges FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_badges_delete_own" ON user_badges FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 7. Função para conceder insígnia a um usuário
CREATE OR REPLACE FUNCTION award_badge(p_user_id UUID, p_badge_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Verificar se o usuário já tem a insígnia
  IF NOT EXISTS (
    SELECT 1 FROM user_badges 
    WHERE user_id = p_user_id AND badge_id = p_badge_id
  ) THEN
    -- Conceder a insígnia
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (p_user_id, p_badge_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Função para verificar se um usuário tem uma insígnia específica
CREATE OR REPLACE FUNCTION user_has_badge(p_user_id UUID, p_badge_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_badge BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM user_badges
    WHERE user_id = p_user_id AND badge_id = p_badge_id
  ) INTO has_badge;
  
  RETURN COALESCE(has_badge, false);
END;
$$ LANGUAGE plpgsql STABLE;

-- 9. Função para conceder insígnias automáticas baseadas em critérios
CREATE OR REPLACE FUNCTION check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  badge_record RECORD;
BEGIN
  -- Loop pelas insígnias que exigem pontos
  FOR badge_record IN 
    SELECT id, name, points_required 
    FROM badges 
    WHERE active = true AND points_required > 0
  LOOP
    -- Verificar se o usuário atingiu os pontos necessários
    IF (NEW.balance_after >= badge_record.points_required) AND 
       (NOT user_has_badge(NEW.user_id, badge_record.id)) THEN
      -- Conceder a insígnia
      PERFORM award_badge(NEW.user_id, badge_record.id);
      
      -- Criar notificação
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        icon
      ) VALUES (
        NEW.user_id,
        'badge',
        'Nova Insígnia Desbloqueada!',
        'Parabéns! Você ganhou a insígnia "' || badge_record.name || '"',
        '🏆'
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger para verificar insígnias ao ganhar pontos
DROP TRIGGER IF EXISTS trigger_check_badges ON cyber_points_history;
CREATE TRIGGER trigger_check_badges
  AFTER INSERT ON cyber_points_history
  FOR EACH ROW
  WHEN (NEW.points > 0)
  EXECUTE FUNCTION check_and_award_badges();

-- 11. Verificar tabelas criadas
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('badges', 'user_badges')
ORDER BY table_name, ordinal_position;

-- 12. Inserir algumas insígnias padrão
INSERT INTO badges (name, description, icon, rarity, points_required, active) VALUES
  ('Primeiros Passos', 'Ganhe sua primeira insígnia ao fazer login', '👣', 'common', 0, true),
  ('Aventureiro', 'Ganhe 100 CyberPoints', '⚔️', 'common', 100, true),
  ('Conquistador', 'Ganhe 500 CyberPoints', '👑', 'rare', 500, true),
  ('Mestre dos Pontos', 'Ganhe 1000 CyberPoints', '🧙', 'epic', 1000, true),
  ('Lenda', 'Ganhe 5000 CyberPoints', '🌟', 'legendary', 5000, true)
ON CONFLICT (name) DO NOTHING;