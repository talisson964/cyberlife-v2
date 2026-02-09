-- Adicionar coluna de contagem de insígnias na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS badges_count INTEGER DEFAULT 0;

-- Função para contar e atualizar insígnias
CREATE OR REPLACE FUNCTION update_badges_count()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    target_user_id := OLD.user_id;
  ELSE
    target_user_id := NEW.user_id;
  END IF;

  UPDATE profiles
  SET badges_count = (
    SELECT count(*)
    FROM user_badges
    WHERE user_badges.user_id = target_user_id
  )
  WHERE id = target_user_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contagem ao inserir/deletar insígnias do usuário
DROP TRIGGER IF EXISTS on_user_badges_change ON user_badges;

CREATE TRIGGER on_user_badges_change
AFTER INSERT OR DELETE ON user_badges
FOR EACH ROW
EXECUTE FUNCTION update_badges_count();

-- Recalcular contadores existentes (para dados legados)
UPDATE profiles
SET badges_count = (
  SELECT count(*)
  FROM user_badges
  WHERE user_badges.user_id = profiles.id
);
