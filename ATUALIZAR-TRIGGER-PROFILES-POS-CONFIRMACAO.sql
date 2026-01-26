-- ATUALIZAÇÃO: Criar perfil somente após confirmação de email
-- Este script atualiza a função e trigger para criar perfis APÓS confirmação de email

-- Adiciona o campo birth_date se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_date DATE;
        COMMENT ON COLUMN public.profiles.birth_date IS 'Data de nascimento do usuário';
    END IF;
END $$;

-- Função para criar perfil automaticamente quando usuário confirma email
-- MODIFICADO: Só cria perfil APÓS confirmação do email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_birth_date DATE;
  v_age INTEGER;
  v_city TEXT;
  v_state TEXT;
  v_whatsapp TEXT;
  v_nickname TEXT;
BEGIN
  -- Só criar perfil se o email já foi confirmado
  -- Isso evita criar perfis para contas que nunca serão ativadas
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Extrair valores dos metadados com valores padrão
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário');
  v_birth_date := COALESCE(
    (NEW.raw_user_meta_data->>'birth_date')::date,
    CURRENT_DATE - INTERVAL '18 years'
  );
  v_age := COALESCE((NEW.raw_user_meta_data->>'age')::integer, 18);
  v_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Não informado');
  v_state := COALESCE(NEW.raw_user_meta_data->>'state', 'SP');
  v_whatsapp := COALESCE(NEW.raw_user_meta_data->>'whatsapp', '');
  -- Gerar nickname único baseado no nome ou ID
  v_nickname := COALESCE(NEW.raw_user_meta_data->>'nickname', 
               LOWER(REPLACE(v_full_name, ' ', '_')) || '_' || 
               SUBSTRING(NEW.id::TEXT, 1, 8));

  -- Inserir perfil
  INSERT INTO public.profiles (
    id, email, full_name, birth_date, age, city, state, whatsapp, nickname
  )
  VALUES (
    NEW.id, NEW.email, v_full_name, v_birth_date,
    v_age, v_city, v_state, v_whatsapp, v_nickname
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover triggers antigos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;

-- Criar trigger que só executa APÓS confirmação do email
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Função para conceder insígnia de boas-vindas após confirmação
CREATE OR REPLACE FUNCTION public.grant_welcome_badge_on_confirmation()
RETURNS TRIGGER AS $$
DECLARE
  v_badge_id UUID;
BEGIN
  -- Buscar o ID da insígnia "Bem Vindo à CyberLife"
  SELECT id INTO v_badge_id FROM badges WHERE name ILIKE 'Bem Vindo à CyberLife' LIMIT 1;
  
  -- Se encontrarmos a insígnia, conceder ao usuário
  IF v_badge_id IS NOT NULL THEN
    INSERT INTO user_badges (user_id, badge_id, awarded_at)
    VALUES (NEW.id, v_badge_id, NOW())
    ON CONFLICT (user_id, badge_id) DO NOTHING; -- Evitar duplicatas
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao conceder insígnia de boas-vindas: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para conceder insígnia quando o email é confirmado
DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_badge ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_badge
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.grant_welcome_badge_on_confirmation();