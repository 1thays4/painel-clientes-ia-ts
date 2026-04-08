-- Criar tabela de mensagens enviadas
CREATE TABLE IF NOT EXISTS mensagens_enviadas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  conteudo TEXT
);

-- Criar índice para melhorar performance das consultas por cliente e data
CREATE INDEX IF NOT EXISTS idx_mensagens_cliente_data ON mensagens_enviadas (cliente_id, timestamp);

-- Comentário na tabela
COMMENT ON TABLE mensagens_enviadas IS 'Registro de mensagens enviadas pelos clientes';