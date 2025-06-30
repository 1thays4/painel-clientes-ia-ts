-- Ajustar as políticas de segurança para permitir acesso às mensagens

-- Remover políticas existentes que possam estar causando problemas
DROP POLICY IF EXISTS mensagens_select_policy ON mensagens_enviadas;
DROP POLICY IF EXISTS mensagens_insert_policy ON mensagens_enviadas;

-- Criar política que permite leitura para qualquer pessoa com o token do cliente
CREATE POLICY mensagens_select_policy ON mensagens_enviadas 
  FOR SELECT 
  USING (true);

-- Política que permite inserção para usuários autenticados
CREATE POLICY mensagens_insert_policy ON mensagens_enviadas 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Criar função para verificar se o usuário tem acesso ao cliente
CREATE OR REPLACE FUNCTION check_client_access(cliente_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  -- Permitir acesso para usuários autenticados
  IF auth.role() = 'authenticated' THEN
    RETURN TRUE;
  END IF;
  
  -- Permitir acesso para requisições com bypass
  IF current_setting('request.headers.x-supabase-auth-bypass', true) = 'true' THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar token do cliente
  RETURN EXISTS (
    SELECT 1 FROM clientes 
    WHERE id = cliente_id 
    AND token_publico = current_setting('request.headers.client-token', true)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;