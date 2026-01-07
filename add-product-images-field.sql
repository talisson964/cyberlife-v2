-- ============================================
-- ADICIONAR SUPORTE A MÚLTIPLAS IMAGENS
-- Permite até 9 imagens por produto
-- Data: 07 de Janeiro de 2026
-- ============================================

-- Adicionar coluna para armazenar array de URLs de imagens
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.products.images IS 'Array de URLs de imagens adicionais do produto (até 9 imagens). Formato: [{"url": "...", "order": 1}, ...]';

-- Criar índice GIN para buscas eficientes no JSONB
CREATE INDEX IF NOT EXISTS idx_products_images ON public.products USING GIN (images);

-- ============================================
-- CONFIGURAÇÃO DO STORAGE
-- Execute estas instruções manualmente no Supabase Dashboard > Storage
-- ============================================

-- 1. Criar bucket 'product-images' (se não existir)
-- No Dashboard: Storage > Create bucket
-- Nome: product-images
-- Public: true (para acesso público às imagens)

-- 2. Configurar políticas de acesso
-- Permitir leitura pública de todas as imagens

-- Política para SELECT (leitura pública)
-- CREATE POLICY "Public can view product images"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'product-images');

-- Política para INSERT (apenas usuários autenticados)
-- CREATE POLICY "Authenticated users can upload product images"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'product-images');

-- Política para UPDATE (apenas proprietário ou admin)
-- CREATE POLICY "Users can update own product images"
-- ON storage.objects FOR UPDATE
-- TO authenticated
-- USING (bucket_id = 'product-images');

-- Política para DELETE (apenas proprietário ou admin)
-- CREATE POLICY "Users can delete own product images"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'product-images');

-- ============================================
-- ORIENTAÇÕES PARA UPLOAD DE IMAGENS
-- ============================================

-- FORMATOS ACEITOS:
-- - JPG/JPEG (recomendado para fotos)
-- - PNG (recomendado para imagens com transparência)
-- - WEBP (melhor compressão)

-- ESPECIFICAÇÕES:
-- - Resolução recomendada: 1200x1200px (quadrada) ou 1200x800px (retangular)
-- - Tamanho máximo: 2MB por imagem
-- - Proporção: 1:1 (quadrada) ou 3:2 (retangular)
-- - Qualidade: 85% (equilíbrio entre qualidade e tamanho)

-- OTIMIZAÇÃO:
-- - Usar compressão adequada antes do upload
-- - Redimensionar imagens grandes
-- - Remover metadados EXIF desnecessários
-- - Converter para WEBP quando possível para melhor performance

SELECT 'Migration executada com sucesso! Agora os produtos suportam até 9 imagens.' AS status;
