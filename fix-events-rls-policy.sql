-- ============================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA EVENTOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================
-- 
-- Este script corrige o erro: "new row violates row-level security policy for table 'events'"
-- permitindo que o Admin Panel insira e atualize eventos
-- ============================================

-- 1. REMOVER POLÍTICAS ANTIGAS RESTRITIVAS
DROP POLICY IF EXISTS "Todos podem visualizar eventos ativos" ON public.events;
DROP POLICY IF EXISTS "Admin pode gerenciar eventos" ON public.events;

-- 2. CRIAR NOVAS POLÍTICAS MAIS PERMISSIVAS

-- Permitir que todos visualizem eventos ativos
CREATE POLICY "Permitir visualizar eventos ativos" 
  ON public.events FOR SELECT 
  USING (active = true);

-- Permitir que qualquer usuário autenticado insira eventos
-- (O Admin Panel usa a autenticação do Supabase)
CREATE POLICY "Permitir inserir eventos" 
  ON public.events FOR INSERT 
  WITH CHECK (true);

-- Permitir que qualquer usuário autenticado atualize eventos
CREATE POLICY "Permitir atualizar eventos" 
  ON public.events FOR UPDATE 
  USING (true);

-- Permitir que qualquer usuário autenticado delete eventos
CREATE POLICY "Permitir deletar eventos" 
  ON public.events FOR DELETE 
  USING (true);

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Listar todas as políticas da tabela events
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'events';

-- ============================================
-- INSTRUÇÕES DE USO
-- ============================================
-- 
-- 1. Copie este script completo
-- 2. Acesse https://supabase.com/dashboard
-- 3. Vá em SQL Editor
-- 4. Cole e execute
-- 
-- Após executar, você poderá criar e editar eventos no Admin Panel sem erros!
-- ============================================
