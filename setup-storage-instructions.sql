-- ============================================
-- INSTRUÇÕES PARA CONFIGURAR STORAGE NO SUPABASE
-- Execute manualmente no Supabase Dashboard
-- ============================================

/*
PASSO 1: Criar os Buckets
-----------------------
1. Acesse: Supabase Dashboard > Storage
2. Clique em "Create bucket"

BUCKET 1 - Imagens de Produtos:
3. Preencha:
   - Name: product-images
   - Public bucket: ✅ Marque como PUBLIC (para acesso público às imagens)
4. Clique em "Create bucket"

BUCKET 2 - Modelos 3D:
5. Preencha:
   - Name: product-3d-models
   - Public bucket: ✅ Marque como PUBLIC (para acesso aos modelos .glb)
6. Clique em "Create bucket"
*/

-- ============================================
-- PASSO 2: Configurar Políticas de Acesso
-- Execute no SQL Editor
-- ============================================

-- Permitir que TODOS visualizem as imagens (leitura pública)
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Permitir que usuários AUTENTICADOS façam upload
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Permitir que usuários AUTENTICADOS atualizem suas imagens
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Permitir que usuários AUTENTICADOS deletem imagens
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ============================================
-- POLÍTICAS PARA MODELOS 3D (.glb)
-- ============================================

-- Permitir que TODOS visualizem os modelos 3D (leitura pública)
CREATE POLICY "Public can view product 3D models"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-3d-models');

-- Permitir que usuários AUTENTICADOS façam upload de modelos 3D
CREATE POLICY "Authenticated users can upload 3D models"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-3d-models');

-- Permitir que usuários AUTENTICADOS atualizem modelos 3D
CREATE POLICY "Authenticated users can update 3D models"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-3d-models');

-- Permitir que usuários AUTENTICADOS deletem modelos 3D
CREATE POLICY "Authenticated users can delete 3D models"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-3d-models');

-- ============================================
-- PASSO 3: Verificar Configuração
-- ============================================

-- Verificar se os buckets foram criados corretamente
SELECT * FROM storage.buckets WHERE id IN ('product-images', 'product-3d-models');

-- Verificar políticas ativas
    SELECT * FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects';

-- ============================================
-- ESTRUTURA DE PASTAS SUGERIDA NOS BUCKETS
-- ============================================

/*
product-images/
  ├── products/
  │   ├── {product_id}/
  │   │   ├── image_1.jpg
  │   │   ├── image_2.jpg
  │   │   └── ...
  │   └── ...
  └── thumbnails/ (opcional - para versões otimizadas)
      └── {product_id}/
          ├── thumb_1.jpg
          └── ...

product-3d-models/
  └── products/
      ├── {product_id}/
      │   ├── model.glb
      │   ├── textures/ (se houver texturas separadas)
      │   │   ├── texture_1.png
      │   │   └── ...
      │   └── ...
      └── ...
*/

-- ============================================
-- CONFIGURAÇÕES OPCIONAIS
-- ============================================

-- Configurar tamanho máximo de arquivo
-- Isso é configurado no Supabase Dashboard > Storage > Settings

-- Para product-images: 
--   File size limit: 10 MB (imagens JPG/PNG/WEBP)

-- Para product-3d-models:
--   File size limit: 50 MB (modelos .glb podem ser maiores)
--   IMPORTANTE: Modelos 3D otimizados devem ter < 20MB para melhor performance

-- Para otimização, considere:
-- 1. Ativar Image Transformation (transforma imagens automaticamente)
-- 2. Configurar CDN para melhor performance
-- 3. Implementar limpeza automática de imagens não utilizadas

SELECT 'Configuração de Storage concluída! Pronto para fazer uploads.' AS status;
