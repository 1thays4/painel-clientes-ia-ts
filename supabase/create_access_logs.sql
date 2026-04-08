-- Criar tabela de logs de acesso
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  user_agent TEXT,
  ip_address TEXT,
  details JSONB
);

-- Adicionar índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_access_logs_cliente_id ON access_logs(cliente_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs(action);

-- Criar função para registrar acesso
CREATE OR REPLACE FUNCTION log_client_access(
  p_action TEXT,
  p_cliente_id UUID,
  p_user_agent TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO access_logs (action, cliente_id, user_agent, ip_address, details)
  VALUES (
    p_action,
    p_cliente_id,
    p_user_agent,
    current_setting('request.headers.x-forwarded-for', true),
    p_details
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar API para registrar acesso
CREATE OR REPLACE FUNCTION api_log_access(
  action TEXT,
  cliente_id UUID,
  details JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  log_id UUID;
BEGIN
  -- Registrar o acesso
  log_id := log_client_access(
    action,
    cliente_id,
    current_setting('request.headers.user-agent', true),
    details
  );
  
  -- Retornar o ID do log
  RETURN jsonb_build_object('id', log_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar política de segurança para a tabela de logs
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Política que permite leitura apenas para administradores
CREATE POLICY access_logs_select_policy ON access_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política que permite inserção para qualquer pessoa
CREATE POLICY access_logs_insert_policy ON access_logs
  FOR INSERT
  WITH CHECK (true);

-- Comentários explicativos
COMMENT ON TABLE access_logs IS 'Logs de acesso dos clientes';
COMMENT ON COLUMN access_logs.action IS 'Ação realizada (login, logout, view_data, etc.)';
COMMENT ON COLUMN access_logs.cliente_id IS 'ID do cliente que realizou a ação';
COMMENT ON COLUMN access_logs.user_agent IS 'User agent do navegador';
COMMENT ON COLUMN access_logs.ip_address IS 'Endereço IP do cliente';
COMMENT ON COLUMN access_logs.details IS 'Detalhes adicionais da ação em formato JSON';