-- Habilitar RLS na tabela mensagens_enviadas
ALTER TABLE mensagens_enviadas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS mensagens_select_policy ON mensagens_enviadas;
DROP POLICY IF EXISTS mensagens_insert_policy ON mensagens_enviadas;

-- Criar política simples que permite acesso a todos (temporariamente)
CREATE POLICY mensagens_select_policy ON mensagens_enviadas 
  FOR SELECT 
  USING (true);

-- Política que permite inserção apenas para usuários autenticados
CREATE POLICY mensagens_insert_policy ON mensagens_enviadas 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');