-- ============================================
-- TABELA DE LOGS DE ACESSO
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Criar tabela de logs de acesso
CREATE TABLE IF NOT EXISTS public.access_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_name TEXT,
  access_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_hour TIME DEFAULT LOCALTIME,
  city TEXT,
  state TEXT,
  ip_address TEXT,
  user_agent TEXT,
  page_visited TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX idx_access_logs_date ON public.access_logs(access_date);
CREATE INDEX idx_access_logs_email ON public.access_logs(user_email);
CREATE INDEX idx_access_logs_state ON public.access_logs(state);

-- Habilitar RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Admin pode ver todos os logs
CREATE POLICY "Admin can view all logs" 
  ON public.access_logs FOR SELECT 
  USING (true);

-- Usuários podem ver apenas seus próprios logs
CREATE POLICY "Users can view own logs" 
  ON public.access_logs FOR SELECT 
  USING (auth.uid() = user_id);

-- Sistema pode inserir logs (SECURITY DEFINER)
CREATE POLICY "System can insert logs" 
  ON public.access_logs FOR INSERT 
  WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE public.access_logs IS 'Registra todos os acessos de usuários ao site';
COMMENT ON COLUMN public.access_logs.user_id IS 'ID do usuário autenticado (NULL se anônimo)';
COMMENT ON COLUMN public.access_logs.user_email IS 'Email do usuário';
COMMENT ON COLUMN public.access_logs.user_name IS 'Nome do usuário';
COMMENT ON COLUMN public.access_logs.access_date IS 'Data e hora completa do acesso';
COMMENT ON COLUMN public.access_logs.access_hour IS 'Hora do acesso (formato TIME)';
COMMENT ON COLUMN public.access_logs.city IS 'Cidade do usuário';
COMMENT ON COLUMN public.access_logs.state IS 'Estado do usuário';
COMMENT ON COLUMN public.access_logs.ip_address IS 'Endereço IP do acesso';
COMMENT ON COLUMN public.access_logs.user_agent IS 'Navegador/dispositivo usado';
COMMENT ON COLUMN public.access_logs.page_visited IS 'Página acessada';
COMMENT ON COLUMN public.access_logs.session_id IS 'ID da sessão do usuário';

-- ============================================
-- VERIFICAÇÃO
-- Execute para ver logs criados:
-- SELECT * FROM public.access_logs ORDER BY access_date DESC;
-- ============================================

-- Query útil: Ver últimos 10 acessos
-- SELECT 
--   user_name, 
--   user_email, 
--   city, 
--   state, 
--   access_date,
--   page_visited
-- FROM public.access_logs 
-- ORDER BY access_date DESC 
-- LIMIT 10;

-- Query útil: Contar acessos por estado
-- SELECT state, COUNT(*) as total_acessos
-- FROM public.access_logs
-- GROUP BY state
-- ORDER BY total_acessos DESC;

-- Query útil: Acessos por usuário
-- SELECT 
--   user_email,
--   user_name,
--   COUNT(*) as total_acessos,
--   MAX(access_date) as ultimo_acesso
-- FROM public.access_logs
-- WHERE user_id IS NOT NULL
-- GROUP BY user_email, user_name
-- ORDER BY total_acessos DESC;
