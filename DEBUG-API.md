# Guia de Depuração da API

Este guia explica como depurar o endpoint `registrar-mensagem.ts` para identificar problemas.

## Logs de Depuração

O arquivo `registrar-mensagem.ts` foi modificado para incluir logs detalhados que ajudam a identificar problemas. Os logs usam os seguintes prefixos:

- `🔍 DEBUG:` - Informações gerais de depuração
- `✅ DEBUG:` - Operações bem-sucedidas
- `❌ DEBUG:` - Erros e falhas

## Como Testar o Endpoint

### Método 1: Usando o Script de Teste

1. Certifique-se de que o servidor está rodando:
   ```
   npm run start:server
   ```

2. Em outro terminal, execute o script de teste:
   ```
   npm run test:api
   ```

3. Observe os logs no console para identificar possíveis problemas.

### Método 2: Usando Ferramentas como Postman ou Insomnia

1. Envie uma requisição POST para `http://localhost:3000/api/registrar-mensagem`
2. Use o seguinte formato de corpo da requisição:
   ```json
   {
     "whatsappNumero": "+15557811105",
     "pergunta": "Esta é uma mensagem de teste",
     "resposta": "Esta é uma resposta de teste",
     "numeroDestino": "+5511999999999",
     "numeroRemetente": "+15557811105"
   }
   ```

## Problemas Comuns e Soluções

### Cliente não encontrado

Se você receber o erro "Cliente não encontrado", verifique:
- Se o número de WhatsApp está cadastrado no banco de dados
- Se o formato do número está correto (com ou sem o prefixo "+")
- Se há espaços ou caracteres especiais no número

### Erro ao registrar mensagem

Se você receber o erro "Erro ao registrar mensagem", verifique:
- Se todos os campos obrigatórios estão sendo enviados
- Se o cliente existe e tem um ID válido
- Se há problemas de conexão com o banco de dados

### Erro interno do servidor

Se você receber o erro "Erro interno do servidor", verifique:
- Os logs do servidor para identificar exceções não tratadas
- Se as variáveis de ambiente estão configuradas corretamente
- Se o banco de dados está acessível

## Verificando o Banco de Dados

Para verificar se os dados estão sendo salvos corretamente:

1. Acesse o painel do Supabase
2. Verifique a tabela `mensagens_enviadas` para confirmar se os registros estão sendo criados
3. Verifique a tabela `clientes` para confirmar se o contador de mensagens está sendo atualizado

## Modificando o Script de Teste

Se precisar testar com diferentes dados, edite o arquivo `src/scripts/testar-registrar-mensagem.ts` e altere o objeto `dadosTeste` com os valores desejados.