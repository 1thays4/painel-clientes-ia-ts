# Correção do Erro de Tipo UUID

Este documento explica a correção do erro de incompatibilidade de tipos entre as tabelas `clientes` e `clientes_finais`.

## O Problema

O erro ocorreu porque a tabela `clientes` usa UUID como tipo de chave primária, mas estávamos tentando criar uma chave estrangeira usando BIGINT:

```
ERROR: 42804: foreign key constraint "clientes_finais_cliente_id_fkey" cannot be implemented
DETAIL: Key columns "cliente_id" and "id" are of incompatible types: bigint and uuid.
```

## Solução

1. **Correção do script SQL**:
   - Alteramos o tipo de dados da coluna `cliente_id` na tabela `clientes_finais` para UUID para corresponder ao tipo da tabela `clientes`:

```sql
-- Criar tabela de clientes finais (usuários finais)
CREATE TABLE IF NOT EXISTS clientes_finais (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  cliente_id UUID REFERENCES clientes(id),  -- Alterado para UUID
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacoes TEXT
);
```

2. **Atualizações no código TypeScript**:
   - Atualizamos a interface `Mensagem` para refletir que `cliente_id` é um UUID (string)
   - Corrigimos os dados de demonstração para usar strings como IDs de cliente
   - Atualizamos os componentes `ClienteSelector` e `ClienteFinalSelector` para trabalhar com UUIDs

3. **Novo serviço para clientes finais**:
   - Criamos um arquivo `cliente-final.ts` com funções CRUD para gerenciar clientes finais
   - Definimos a interface `ClienteFinal` com os tipos corretos

## Como Executar a Correção

1. Execute o script SQL corrigido em `supabase/add_cliente_final.sql`
2. Reinicie a aplicação para usar as interfaces e serviços atualizados

## Observações Importantes

- Os IDs de clientes (empresas) são UUIDs (strings)
- Os IDs de clientes finais são BIGINT (números)
- Ao trabalhar com relações entre tabelas, sempre verifique a compatibilidade dos tipos de dados