# Identificação de Clientes e Clientes Finais

Este documento explica como o sistema identifica e processa mensagens de diferentes tipos de clientes.

## Lógica de Identificação

O sistema agora distingue entre dois tipos de usuários:

1. **Proprietário/Cliente Direto**
   - Identificado pelo número de WhatsApp: `+55 47 9195-0615`
   - Mensagens deste número são tratadas como vindas de um cliente direto (empresa)
   - Registradas diretamente na tabela `clientes`

2. **Clientes Finais**
   - Qualquer outro número de WhatsApp
   - Mensagens destes números são tratadas como vindas de clientes finais
   - Registradas na tabela `clientes_finais` e associadas a uma empresa

## Fluxo de Processamento

Quando uma mensagem é recebida:

1. O sistema limpa o número de WhatsApp (remove prefixos e espaços)
2. Verifica se o número corresponde ao do proprietário (`+55 47 9195-0615`)
3. Se for o proprietário:
   - Busca ou cria um registro na tabela `clientes`
   - Registra a mensagem associada a este cliente
4. Se for um cliente final:
   - Busca uma empresa para associar (atualmente usa a primeira disponível)
   - Busca o cliente final pelo número de WhatsApp
   - Se não encontrar, cria um novo registro na tabela `clientes_finais`
   - Registra a mensagem associada à empresa e ao cliente final

## Registros de Mensagens

As mensagens agora contêm:
- `cliente_id`: ID da empresa (UUID)
- `cliente_final_id`: ID do cliente final (número), apenas para mensagens de clientes finais
- Outros dados da mensagem (pergunta, resposta, timestamp)

## Observações

- Para adicionar mais empresas como clientes diretos, adicione seus números à lista de verificação
- A associação automática de clientes finais a empresas pode ser refinada conforme necessário
- O sistema mantém compatibilidade com mensagens antigas que não têm `cliente_final_id`