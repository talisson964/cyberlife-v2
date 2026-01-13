-- SISTEMA DE BÔNUS DE BOAS-VINDAS
-- Dar 10 pontos CyberPoints quando um novo perfil é criado

-- 1. Criar função para dar pontos de boas-vindas
CREATE OR REPLACE FUNCTION give_welcome_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Dar 10 pontos de boas-vindas para novos usuários
  NEW.cyber_points := COALESCE(NEW.cyber_points, 0) + 10;
  
  -- Registrar no histórico
  INSERT INTO cyber_points_history (
    user_id,
    points,
    type,
    description,
    created_at
  ) VALUES (
    NEW.id,
    10,
    'bonus',
    'Bônus de boas-vindas',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger para executar ao criar perfil
DROP TRIGGER IF EXISTS trigger_welcome_points ON profiles;
CREATE TRIGGER trigger_welcome_points
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION give_welcome_points();

-- 3. Verificar se funcionou
SELECT 
  id, 
  email, 
  cyber_points, 
  created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
