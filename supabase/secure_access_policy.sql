-- Habilitar RLS (Row Level Security) na tabela mensagens_enviadas
ALTER TABLE mensagens_enviadas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS mensagens_select_policy ON mensagens_enviadas;
DROP POLICY IF EXISTS mensagens_insert_policy ON mensagens_enviadas;

-- Adicionar coluna para armazenar o token de acesso temporário
ALTER TABLE mensagens_enviadas ADD COLUMN IF NOT EXISTS session_token TEXT;

-- Criar função para verificar token de sessão
CREATE OR REPLACE FUNCTION check_session_token(cliente_id UUID, token TEXT) RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se o token corresponde ao cliente
  RETURN EXISTS (
    SELECT 1 FROM clientes 
    WHERE id = cliente_id 
    AND token_publico = token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política que permite leitura apenas para o cliente dono dos dados
-- usando o token da sessão para autenticação
CREATE POLICY mensagens_select_policy ON mensagens_enviadas 
  FOR SELECT 
  USING (
    check_session_token(cliente_id, current_setting('request.headers.client-token', true))
  );

-- Política que permite inserção apenas para usuários autenticados
CREATE POLICY mensagens_insert_policy ON mensagens_enviadas 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');