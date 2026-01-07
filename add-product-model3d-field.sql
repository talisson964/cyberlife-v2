-- ============================================
-- MIGRAÇÃO: Adicionar suporte para Modelo 3D
-- Execute no Supabase SQL Editor
-- ============================================

-- Adicionar coluna para armazenar URL do modelo 3D (.glb)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS model_3d TEXT;

-- Comentário para documentação
COMMENT ON COLUMN products.model_3d IS 'URL do modelo 3D em formato .glb para visualização interativa do produto';

-- Verificar que a coluna foi criada
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products' 
AND column_name = 'model_3d';

-- ============================================
-- EXEMPLO DE USO
-- ============================================

/*
-- Inserir produto com modelo 3D
INSERT INTO products (name, price, category, model_3d)
VALUES ('Boneco Action Figure', 199.90, 'geek', 
        'https://seu-projeto.supabase.co/storage/v1/object/public/product-3d-models/products/123/model.glb');

-- Atualizar produto existente com modelo 3D
UPDATE products 
SET model_3d = 'https://seu-projeto.supabase.co/storage/v1/object/public/product-3d-models/products/456/modelo-3d.glb'
WHERE id = 456;

-- Buscar produtos que têm modelo 3D
SELECT id, name, model_3d 
FROM products 
WHERE model_3d IS NOT NULL;
*/

SELECT 'Campo model_3d adicionado com sucesso!' AS status;
