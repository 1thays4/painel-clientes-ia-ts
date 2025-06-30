-- Desabilitar RLS na tabela mensagens_enviadas para permitir acesso público
ALTER TABLE mensagens_enviadas DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS mensagens_select_policy ON mensagens_enviadas;
DROP POLICY IF EXISTS mensagens_insert_policy ON mensagens_enviadas;