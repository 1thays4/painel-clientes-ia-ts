-- Desabilitar RLS em todas as tabelas relevantes
ALTER TABLE mensagens_enviadas DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes_finais DISABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_final DISABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_final_whatsapp DISABLE ROW LEVEL SECURITY;
ALTER TABLE contatos_clientes DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS mensagens_select_policy ON mensagens_enviadas;
DROP POLICY IF EXISTS mensagens_insert_policy ON mensagens_enviadas;
DROP POLICY IF EXISTS clientes_select_policy ON clientes;
DROP POLICY IF EXISTS clientes_finais_select_policy ON clientes_finais;

-- Verificar quais tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;