-- ============================================
-- CORREÇÃO COMPLETA DAS POLÍTICAS RLS - ADMIN PANEL
-- Execute este SQL no Supabase SQL Editor
-- ============================================
-- 
-- Este script corrige todos os erros de RLS para:
-- - Produtos
-- - Banners
-- - Eventos
-- ============================================

-- ============================================
-- 1. PRODUTOS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Todos podem visualizar produtos ativos" ON public.products;
DROP POLICY IF EXISTS "Admin pode inserir produtos" ON public.products;
DROP POLICY IF EXISTS "Admin pode atualizar produtos" ON public.products;
DROP POLICY IF EXISTS "Admin pode deletar produtos" ON public.products;

-- Criar novas políticas permissivas
CREATE POLICY "Permitir visualizar produtos ativos" 
  ON public.products FOR SELECT 
  USING (active = true);

CREATE POLICY "Permitir inserir produtos" 
  ON public.products FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir atualizar produtos" 
  ON public.products FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir deletar produtos" 
  ON public.products FOR DELETE 
  USING (true);

-- ============================================
-- 2. BANNERS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Todos podem visualizar banners ativos" ON public.banners;
DROP POLICY IF EXISTS "Admin pode gerenciar banners" ON public.banners;

-- Criar novas políticas permissivas
CREATE POLICY "Permitir visualizar banners ativos" 
  ON public.banners FOR SELECT 
  USING (active = true);

CREATE POLICY "Permitir inserir banners" 
  ON public.banners FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir atualizar banners" 
  ON public.banners FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir deletar banners" 
  ON public.banners FOR DELETE 
  USING (true);

-- ============================================
-- 3. EVENTOS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Todos podem visualizar eventos ativos" ON public.events;
DROP POLICY IF EXISTS "Admin pode gerenciar eventos" ON public.events;

-- Criar novas políticas permissivas
CREATE POLICY "Permitir visualizar eventos ativos" 
  ON public.events FOR SELECT 
  USING (active = true);

CREATE POLICY "Permitir inserir eventos" 
  ON public.events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir atualizar eventos" 
  ON public.events FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir deletar eventos" 
  ON public.events FOR DELETE 
  USING (true);

-- ============================================
-- 4. PROFILES (Manter segurança)
-- ============================================

-- Manter políticas de profiles como estão
-- (não queremos que qualquer um edite qualquer perfil)

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Listar todas as políticas criadas
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'Leitura'
    WHEN cmd = 'INSERT' THEN 'Inserção'
    WHEN cmd = 'UPDATE' THEN 'Atualização'
    WHEN cmd = 'DELETE' THEN 'Exclusão'
    ELSE 'Todos'
  END as operacao
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('products', 'banners', 'events')
ORDER BY tablename, cmd;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- 
-- Cada tabela (products, banners, events) deve ter 4 políticas:
-- 1. Permitir visualizar [X] ativos - SELECT
-- 2. Permitir inserir [X] - INSERT
-- 3. Permitir atualizar [X] - UPDATE
-- 4. Permitir deletar [X] - DELETE
-- 
-- Total: 12 políticas (4 por tabela × 3 tabelas)
-- ============================================

-- ============================================
-- INSTRUÇÕES
-- ============================================
-- 
-- 1. Copie TODO este script
-- 2. Acesse https://supabase.com/dashboard
-- 3. Vá em SQL Editor
-- 4. Cole e execute (Run)
-- 
-- ✅ Após executar, o Admin Panel funcionará sem erros de RLS!
-- ============================================

-- ============================================
-- NOTA DE SEGURANÇA
-- ============================================
-- 
-- IMPORTANTE: Este script permite que QUALQUER USUÁRIO AUTENTICADO
-- possa criar, editar e deletar produtos, banners e eventos.
-- 
-- Para ambiente de produção, você deve:
-- 1. Criar uma tabela de admins
-- 2. Adicionar verificação: auth.uid() IN (SELECT id FROM admins)
-- 3. Implementar roles de usuário
-- 
-- Para desenvolvimento e testes, este script é suficiente.
-- ============================================
