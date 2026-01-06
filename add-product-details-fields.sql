-- ============================================
-- ADICIONAR CAMPOS DETALHADOS AOS PRODUTOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================
-- 
-- Este script adiciona campos extras para enriquecer
-- a página de detalhes dos produtos
-- ============================================

-- Adicionar coluna de descrição detalhada
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Adicionar coluna de características (features)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS features TEXT;

-- Adicionar coluna de dimensões
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS dimensions TEXT;

-- Adicionar coluna de peso
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight TEXT;

-- Adicionar coluna de marca
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand TEXT;

-- Adicionar coluna de garantia
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS warranty TEXT;

-- Adicionar coluna de material
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS material TEXT;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN public.products.detailed_description IS 'Descrição completa e detalhada do produto';
COMMENT ON COLUMN public.products.features IS 'Características do produto (uma por linha)';
COMMENT ON COLUMN public.products.dimensions IS 'Dimensões do produto (ex: 20cm x 15cm x 10cm)';
COMMENT ON COLUMN public.products.weight IS 'Peso do produto (ex: 500g)';
COMMENT ON COLUMN public.products.brand IS 'Marca do produto';
COMMENT ON COLUMN public.products.warranty IS 'Garantia do produto (ex: 90 dias)';
COMMENT ON COLUMN public.products.material IS 'Material do produto (ex: Plástico ABS, PVC, Resina)';

-- Verificar a estrutura atualizada
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- 
-- A tabela products agora deve ter as colunas:
-- - detailed_description (TEXT, NULL) - Descrição completa
-- - features (TEXT, NULL) - Características (separadas por linha)
-- - dimensions (TEXT, NULL) - Dimensões do produto
-- - weight (TEXT, NULL) - Peso do produto
-- - brand (TEXT, NULL) - Marca
-- - warranty (TEXT, NULL) - Garantia
-- - material (TEXT, NULL) - Material do produto
-- 
-- Exemplo de uso:
-- detailed_description: "Action figure colecionável premium..."
-- features: "Material premium\nEdição limitada\nArticulações móveis"
-- dimensions: "20 x 15 x 10"
-- weight: "500"
-- brand: "Hot Toys"
-- warranty: "90 dias"
-- material: "Plástico ABS"
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
-- ✅ Após executar, você poderá adicionar detalhes completos aos produtos!
-- ============================================
