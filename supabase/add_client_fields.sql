-- Adicionar campos necessários à tabela clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS mensagens_usadas INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS mensagens_limite INTEGER DEFAULT 1000;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS status_pagamento TEXT DEFAULT 'em_dia';

-- Adicionar comentários explicativos
COMMENT ON COLUMN clientes.mensagens_usadas IS 'Contador de mensagens usadas no mês atual';
COMMENT ON COLUMN clientes.mensagens_limite IS 'Limite de mensagens do plano';
COMMENT ON COLUMN clientes.status_pagamento IS 'Status do pagamento (em_dia, pendente)';

-- Atualizar clientes existentes com valores padrão baseados no plano
UPDATE clientes 
SET mensagens_limite = 
  CASE 
    WHEN plano = 'essencial' THEN 1000
    WHEN plano = 'Profissional' THEN 3000
    WHEN plano = 'Estratégico' THEN 5000
    ELSE 1000
  END
WHERE mensagens_limite IS NULL;