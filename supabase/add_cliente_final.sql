-- Criar tabela de clientes finais (usuários finais)
CREATE TABLE IF NOT EXISTS clientes_finais (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  cliente_id UUID REFERENCES clientes(id),
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacoes TEXT
);

-- Adicionar campo cliente_final_id à tabela mensagens_enviadas
ALTER TABLE mensagens_enviadas ADD COLUMN IF NOT EXISTS cliente_final_id BIGINT REFERENCES clientes_finais(id);