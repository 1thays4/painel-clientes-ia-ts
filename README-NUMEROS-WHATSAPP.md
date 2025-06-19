# Atualização para Salvar Números de WhatsApp

Este documento descreve as alterações feitas para salvar os números de remetente e destinatário nas mensagens.

## Alterações Realizadas

1. **Banco de Dados**
   - Adicionados campos `numero_remetente` e `numero_destino` à tabela `mensagens_enviadas`
   - Execute o script SQL em `supabase/update_mensagens_numeros.sql` para atualizar o banco de dados

2. **API**
   - Atualizada a função `registrarMensagem` para aceitar e salvar os números
   - Atualizada a função `registrarMensagemSimples` para salvar os números
   - Atualizada a função `registrarMensagemWhatsApp` para processar os novos campos

3. **n8n**
   - Criado um novo fluxo atualizado em `n8n-fluxo-atualizado.json`
   - O fluxo agora envia os números de remetente e destinatário para a API
   - O host foi atualizado para `supabase-server:3001`

## Como Atualizar o n8n

1. Acesse o painel do n8n
2. Importe o arquivo `n8n-fluxo-atualizado.json`
3. Verifique se o nó "Registrar Mensagem" está configurado corretamente:
   - URL: `http://supabase-server:3001/api/registrar-mensagem`
   - Corpo da requisição deve incluir `numeroRemetente` e `numeroDestino`

## Exemplo de Payload

```json
{
  "whatsappNumero": "5511999999999",
  "pergunta": "Pergunta do cliente",
  "resposta": "Resposta da IA",
  "numeroRemetente": "+14155238886",
  "numeroDestino": "5511999999999"
}
```

## Verificação

Para verificar se os números estão sendo salvos corretamente:

1. Envie uma mensagem de teste pelo WhatsApp
2. Verifique no painel de administração se os números aparecem corretamente
3. Consulte o banco de dados diretamente:

```sql
SELECT id, pergunta, numero_remetente, numero_destino 
FROM mensagens_enviadas 
ORDER BY timestamp DESC 
LIMIT 10;
```