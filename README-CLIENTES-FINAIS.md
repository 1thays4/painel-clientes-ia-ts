# Separação de Clientes e Clientes Finais

Este documento explica como funciona a separação entre seus clientes (empresas) e os clientes dos seus clientes (usuários finais) no painel de atendimento.

## Estrutura de Dados

O sistema agora distingue entre dois níveis de clientes:

1. **Empresas (Seus Clientes Diretos)**
   - São as empresas que contratam seu serviço
   - Cada empresa tem seu próprio painel e acesso
   - Identificados por `cliente_id`, `nome_cliente`, `whatsapp_cliente`

2. **Clientes Finais (Usuários Finais)**
   - São os clientes das empresas que contratam seu serviço
   - Cada cliente final está associado a uma empresa
   - Identificados por `cliente_final_id`, `nome_cliente_final`, `whatsapp_cliente_final`

## Configuração do Banco de Dados

Execute o script SQL em `supabase/add_cliente_final.sql` para criar a tabela de clientes finais e adicionar o relacionamento com mensagens:

```sql
-- Criar tabela de clientes finais (usuários finais)
CREATE TABLE IF NOT EXISTS clientes_finais (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  cliente_id BIGINT REFERENCES clientes(id),
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observacoes TEXT
);

-- Adicionar campo cliente_final_id à tabela mensagens_enviadas
ALTER TABLE mensagens_enviadas ADD COLUMN IF NOT EXISTS cliente_final_id BIGINT REFERENCES clientes_finais(id);
```

## Como Usar o Painel

### Para Administradores

1. No painel de atendimento, você verá dois seletores:
   - **Selecionar Empresa**: Escolha uma empresa específica ou "Todos os Clientes"
   - **Selecionar Cliente Final**: Após selecionar uma empresa, escolha um cliente final específico

2. Visualização de mensagens:
   - Quando nenhuma empresa está selecionada: As mensagens são agrupadas por empresa
   - Quando uma empresa está selecionada: As mensagens são agrupadas por cliente final
   - Quando uma empresa e um cliente final estão selecionados: Apenas as mensagens desse cliente final são exibidas

### Para Empresas (Seus Clientes)

1. No painel da empresa, as mensagens são automaticamente agrupadas por cliente final
2. Cada grupo de mensagens mostra claramente o nome e WhatsApp do cliente final
3. Ao responder, a interface mostra claramente para qual cliente final a resposta está sendo enviada

## Identificação Visual

- **Empresas**: Identificadas com texto em azul e prefixo "Empresa:"
- **Clientes Finais**: Identificados com texto em verde e prefixo "Cliente:"

Esta separação permite que você e seus clientes (empresas) tenham uma visão clara de quem é quem no sistema, facilitando o atendimento e a organização das conversas.