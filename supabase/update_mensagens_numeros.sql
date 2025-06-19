-- Adicionar campos para números de remetente e destinatário
ALTER TABLE mensagens_enviadas 
ADD COLUMN IF NOT EXISTS numero_remetente TEXT,
ADD COLUMN IF NOT EXISTS numero_destino TEXT;

-- Comentário nos novos campos
COMMENT ON COLUMN mensagens_enviadas.numero_remetente IS 'Número de telefone do remetente da mensagem';
COMMENT ON COLUMN mensagens_enviadas.numero_destino IS 'Número de telefone do destinatário da mensagem';

-- Criar índices para melhorar performance das consultas por número
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens_enviadas (numero_remetente);
CREATE INDEX IF NOT EXISTS idx_mensagens_destino ON mensagens_enviadas (numero_destino);