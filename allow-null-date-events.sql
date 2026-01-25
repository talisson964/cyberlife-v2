-- Script para permitir valores nulos na coluna date e adicionar coluna time na tabela events

-- Remover a restrição NOT NULL da coluna date
ALTER TABLE public.events
ALTER COLUMN date DROP NOT NULL;

-- Adicionar coluna time para armazenar o horário do evento (pode ser nulo)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS time TIME;

-- Atualizar a descrição da coluna date para refletir que pode ser nula
COMMENT ON COLUMN public.events.date IS 'Data do evento (pode ser nula se ainda não definida)';

-- Adicionar comentário para a nova coluna time
COMMENT ON COLUMN public.events.time IS 'Horário do evento (pode ser nulo se ainda não definido)';