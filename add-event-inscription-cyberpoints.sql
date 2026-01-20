-- Adicionar campo de valor da inscri‡Æo em CyberPoints na tabela events 
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS inscription_price_cyberpoints INTEGER; 
 
-- Coment rio descritivo 
COMMENT ON COLUMN public.events.inscription_price_cyberpoints IS 'Valor da inscri‡Æo do evento em CyberPoints'; 
