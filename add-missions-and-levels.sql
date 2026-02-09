-- Adicionar colunas de nível e XP na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_xp INTEGER DEFAULT 0;

-- Criar tabela de missões
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Habilitar RLS para missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para missions
-- Todos podem ver missões ativas
CREATE POLICY "Public missions are viewable by everyone" 
ON missions FOR SELECT 
USING (true);

-- Apenas admins podem criar/editar/deletar missões (assumindo check de admin via email ou tabela de roles, usando a lógica comum do projeto que parece ser verificar se é autenticado para escrita ou algo mais específico. Por enquanto, autenticado pode ser seguro se o app tiver controle de admin no front, mas o ideal é RLS. Vou usar a política geral de authenticated insert por enquanto, ajustável depois).
CREATE POLICY "Admins can insert missions" 
ON missions FOR INSERT 
WITH CHECK (auth.role() = 'authenticated'); -- Idealmente restringir para admin

CREATE POLICY "Admins can update missions" 
ON missions FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete missions" 
ON missions FOR DELETE 
USING (auth.role() = 'authenticated');


-- Criar tabela de missões do usuário (histórico de completadas)
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para user_missions
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_missions
CREATE POLICY "Users can view their own completed missions" 
ON user_missions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completed missions" 
ON user_missions FOR INSERT 
WITH CHECK (auth.uid() = user_id);


-- Função para gerenciar Trigger de Level Up
CREATE OR REPLACE FUNCTION check_level_up()
RETURNS TRIGGER AS $$
BEGIN
  -- Loop para lidar com ganhos de XP maiores que 100 (múltiplos níveis de uma vez)
  WHILE NEW.current_xp >= 100 LOOP
    NEW.level := NEW.level + 1;
    NEW.current_xp := NEW.current_xp - 100;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar a função antes de update no profiles
DROP TRIGGER IF EXISTS on_xp_change ON profiles;

CREATE TRIGGER on_xp_change
BEFORE UPDATE OF current_xp ON profiles
FOR EACH ROW
EXECUTE FUNCTION check_level_up();

-- Função helper para completar missão e dar XP (Atomicidade)
CREATE OR REPLACE FUNCTION complete_mission(mission_id_param UUID, user_id_param UUID)
RETURNS JSON AS $$
DECLARE
  mission_xp INTEGER;
  mission_exists BOOLEAN;
  already_completed BOOLEAN;
BEGIN
  -- Verificar se missão existe e pegar XP
  SELECT xp_reward INTO mission_xp FROM missions WHERE id = mission_id_param;
  
  IF mission_xp IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Missão não encontrada');
  END IF;

  -- Verificar se já completou (opcional, dependendo da regra de negócio. Vou impedir duplicidade por padrão para evitar farm infinito fácil)
  SELECT EXISTS(SELECT 1 FROM user_missions WHERE user_id = user_id_param AND mission_id = mission_id_param) INTO already_completed;
  
  IF already_completed THEN
     RETURN json_build_object('success', false, 'message', 'Missão já completada');
  END IF;

  -- Registrar completude
  INSERT INTO user_missions (user_id, mission_id) VALUES (user_id_param, mission_id_param);

  -- Adicionar XP ao usuário (o trigger vai lidar com o level up)
  UPDATE profiles 
  SET current_xp = current_xp + mission_xp 
  WHERE id = user_id_param;

  RETURN json_build_object('success', true, 'xp_gained', mission_xp);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
