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

-- Índice para melhorar a performance nas buscas por evento
CREATE INDEX IF NOT EXISTS idx_lives_evento_id ON public.lives(evento_id);

-- Índice para melhorar a performance nas buscas por status
CREATE INDEX IF NOT EXISTS idx_lives_status ON public.lives(status);

-- Índice para melhorar a performance nas buscas por data
CREATE INDEX IF NOT EXISTS idx_lives_data_hora_inicio ON public.lives(data_hora_inicio);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_lives_updated_at
  BEFORE UPDATE ON public.lives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Políticas de segurança (RLS) para a tabela de lives
CREATE POLICY "Admin can manage lives" ON public.lives FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Habilitar RLS na tabela de lives
ALTER TABLE public.lives ENABLE ROW LEVEL SECURITY;

-- Atualiza a tabela de eventos para garantir que tenha campo de imagem
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;