-- Adicionar coluna modo à tabela clientes_finais
ALTER TABLE clientes_finais ADD COLUMN IF NOT EXISTS modo BOOLEAN DEFAULT TRUE;

-- Comentário na coluna
COMMENT ON COLUMN clientes_finais.modo IS 'Indica se o modo bot está ativo para este cliente final. Se false, as mensagens não serão respondidas automaticamente pela IA.';