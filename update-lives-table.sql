-- Script para atualizar a tabela de lives com a estrutura correta

-- Adicionando coluna titulo se não existir e removendo nome_jogo se existir
DO $$ 
BEGIN
    -- Adiciona a coluna titulo se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lives' AND column_name = 'titulo') THEN
        ALTER TABLE public.lives ADD COLUMN titulo TEXT NOT NULL DEFAULT '';
    END IF;
    
    -- Remove a coluna nome_jogo se existir
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lives' AND column_name = 'nome_jogo') THEN
        ALTER TABLE public.lives DROP COLUMN nome_jogo;
    END IF;
    
    -- Remove as outras colunas antigas se existirem
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lives' AND column_name = 'data_hora_inicio') THEN
        ALTER TABLE public.lives DROP COLUMN data_hora_inicio;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lives' AND column_name = 'data_hora_fim') THEN
        ALTER TABLE public.lives DROP COLUMN data_hora_fim;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lives' AND column_name = 'plataforma') THEN
        ALTER TABLE public.lives DROP COLUMN plataforma;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lives' AND column_name = 'visualizacoes') THEN
        ALTER TABLE public.lives DROP COLUMN visualizacoes;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lives' AND column_name = 'likes') THEN
        ALTER TABLE public.lives DROP COLUMN likes;
    END IF;
    
    -- Atualiza o CHECK constraint para incluir 'active'
    ALTER TABLE public.lives DROP CONSTRAINT IF EXISTS lives_status_check;
    ALTER TABLE public.lives ADD CONSTRAINT lives_status_check CHECK (status IN ('draft', 'scheduled', 'live', 'completed', 'cancelled', 'active'));
END $$;

-- Garantir que a tabela tenha a estrutura correta
ALTER TABLE public.lives ALTER COLUMN titulo SET NOT NULL;