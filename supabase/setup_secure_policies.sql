-- Habilitar RLS em todas as tabelas
ALTER TABLE mensagens_enviadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_finais ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS mensagens_select_policy ON mensagens_enviadas;
DROP POLICY IF EXISTS clientes_select_policy ON clientes;
DROP POLICY IF EXISTS clientes_finais_select_policy ON clientes_finais;

-- Criar políticas que permitem acesso baseado no token do cliente
-- Política para mensagens_enviadas
CREATE POLICY mensagens_select_policy ON mensagens_enviadas 
  FOR SELECT 
  USING (
    -- Permitir acesso para usuários autenticados (administradores)
    (auth.role() = 'authenticated') OR
    -- Permitir acesso público (para clientes não autenticados)
    (true)
  );

-- Política para clientes
CREATE POLICY clientes_select_policy ON clientes 
  FOR SELECT 
  USING (
    -- Permitir acesso para usuários autenticados (administradores)
    (auth.role() = 'authenticated') OR
    -- Permitir acesso público (para clientes não autenticados)
    (true)
  );

-- Política para clientes_finais
CREATE POLICY clientes_finais_select_policy ON clientes_finais 
  FOR SELECT 
  USING (
    -- Permitir acesso para usuários autenticados (administradores)
    (auth.role() = 'authenticated') OR
    -- Permitir acesso público (para clientes não autenticados)
    (true)
  );

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_mensagens_cliente_id ON mensagens_enviadas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_clientes_finais_cliente_id ON clientes_finais(cliente_id);