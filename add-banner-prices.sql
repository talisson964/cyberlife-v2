-- ============================================
-- ADICIONAR CAMPOS DE PREÇO AOS BANNERS
-- Execute este SQL no Supabase SQL Editor
-- ============================================
-- 
-- Este script adiciona os campos de preço original e final
-- para permitir criar ofertas com valores nos banners
-- ============================================

-- Adicionar coluna de preço original (De:)
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS original_price TEXT;

-- Adicionar coluna de preço final (Por apenas:)
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS final_price TEXT;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN public.banners.original_price IS 'Preço original do produto (De:)';
COMMENT ON COLUMN public.banners.final_price IS 'Preço com desconto (Por apenas:)';

-- Verificar a estrutura atualizada
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'banners'
ORDER BY ordinal_position;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- 
-- A tabela banners agora deve ter as colunas:
-- - original_price (TEXT, NULL) - Preço original
-- - final_price (TEXT, NULL) - Preço final/promocional
-- 
-- Exemplo de uso:
-- original_price: "R$ 299,99"
-- final_price: "R$ 199,99"
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
-- ✅ Após executar, você poderá adicionar preços aos banners!
-- ============================================
