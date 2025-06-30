-- Habilitar RLS na tabela mensagens_enviadas
ALTER TABLE mensagens_enviadas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS mensagens_select_policy ON mensagens_enviadas;
DROP POLICY IF EXISTS mensagens_insert_policy ON mensagens_enviadas;

-- Criar política que permite leitura apenas para o cliente dono das mensagens
CREATE POLICY mensagens_select_policy ON mensagens_enviadas 
  FOR SELECT 
  USING (
    -- Permitir acesso para usuários autenticados (administradores)
    (auth.role() = 'authenticated') OR
    -- Permitir acesso para o cliente dono das mensagens
    (cliente_id::text = current_setting('request.jwt.claims', true)::json->>'cliente_id')
  );

-- Política que permite inserção apenas para usuários autenticados
CREATE POLICY mensagens_insert_policy ON mensagens_enviadas 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');