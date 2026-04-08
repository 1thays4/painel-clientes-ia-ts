-- Adicionar coluna de senha de acesso à tabela de clientes
ALTER TABLE clientes ADD COLUMN senha_acesso TEXT;

-- Atualizar clientes existentes com uma senha padrão (que deve ser alterada posteriormente)
UPDATE clientes SET senha_acesso = '123456' WHERE senha_acesso IS NULL;

-- Comentário explicativo
COMMENT ON COLUMN clientes.senha_acesso IS 'Senha para acesso ao painel do cliente';