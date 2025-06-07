-- Atualizar tabela de mensagens enviadas para incluir pergunta e resposta
ALTER TABLE mensagens_enviadas 
ADD COLUMN IF NOT EXISTS pergunta TEXT,
ADD COLUMN IF NOT EXISTS resposta TEXT;

-- Comentário nos novos campos
COMMENT ON COLUMN mensagens_enviadas.pergunta IS 'Pergunta enviada pelo cliente';
COMMENT ON COLUMN mensagens_enviadas.resposta IS 'Resposta gerada pela IA';

-- Atualizar tabela de clientes para incluir data de cadastro se não existir
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS data_cadastro TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS whatsapp TEXT;