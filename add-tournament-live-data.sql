-- Adicionar campos para gerenciar torneio ao vivo na tabela events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS game_name TEXT,
ADD COLUMN IF NOT EXISTS stream_link TEXT,
ADD COLUMN IF NOT EXISTS current_scores JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ranking JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS participants JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS live_comments TEXT;

-- Comentários descritivos
COMMENT ON COLUMN public.events.is_live IS 'Indica se o torneio está acontecendo agora';
COMMENT ON COLUMN public.events.game_name IS 'Nome do jogo do torneio';
COMMENT ON COLUMN public.events.stream_link IS 'Link da transmissão ao vivo (YouTube, Twitch, etc)';
COMMENT ON COLUMN public.events.current_scores IS 'Placar atual do torneio em formato JSON';
COMMENT ON COLUMN public.events.ranking IS 'Ranking dos jogadores/times em formato JSON';
COMMENT ON COLUMN public.events.participants IS 'Lista de participantes do torneio em formato JSON';
COMMENT ON COLUMN public.events.live_comments IS 'Comentários sobre o andamento do torneio';

-- Criar índice para buscar torneio ativo rapidamente
CREATE INDEX IF NOT EXISTS idx_events_is_live ON public.events(is_live) WHERE is_live = true;
