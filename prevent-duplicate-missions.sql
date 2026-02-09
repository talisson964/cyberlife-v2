-- Adicionar restrição UNIQUE na tabela user_missions
-- Isso garante a nível de banco de dados que um usuário nunca terá duas entradas para a mesma missão
ALTER TABLE user_missions
ADD CONSTRAINT unique_user_mission UNIQUE (user_id, mission_id);
