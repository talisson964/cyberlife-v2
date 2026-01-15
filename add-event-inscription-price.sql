-- Adicionar campo de valor da inscrição na tabela events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS inscription_price TEXT;

-- Comentário descritivo
COMMENT ON COLUMN public.events.inscription_price IS 'Valor da inscrição do evento (ex: R$ 50,00 ou Gratuito)';
