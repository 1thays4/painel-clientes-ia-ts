# Solução de Problemas com o Workflow de Follow-up no n8n

Este documento contém instruções para resolver problemas comuns com o workflow de follow-up automatizado no n8n.

## Problema: Nó OpenAI não está sendo executado

Se o nó "Gerar Mensagem Follow-up" não estiver sendo executado corretamente, siga estas etapas:

### Solução 1: Verificar credenciais do OpenAI

1. No n8n, vá até "Credentials" no menu lateral
2. Verifique se as credenciais do OpenAI estão configuradas corretamente
3. Certifique-se de que a API key não expirou e tem saldo suficiente

### Solução 2: Usar o modelo de chat em vez do assistente

O workflow foi atualizado para usar o modelo de chat (gpt-3.5-turbo) em vez do assistente, pois é mais confiável:

1. Certifique-se de que o nó OpenAI está configurado como "Chat" e não como "Assistant"
2. Use o modelo "gpt-3.5-turbo" que é mais estável
3. Defina um limite de tokens (por exemplo, 150) para evitar respostas muito longas

### Solução 3: Adicionar nó de depuração

Foi adicionado um nó "Debug OpenAI" que:
- Verifica a saída do OpenAI e extrai a mensagem em diferentes formatos
- Fornece mensagens de fallback caso o OpenAI não retorne uma resposta
- Registra informações de depuração no console do n8n

### Solução 4: Verificar os dados de entrada

Se o nó ainda não estiver funcionando:
1. Execute o workflow manualmente e verifique os logs
2. Certifique-se de que o nó "Loop Clientes" está passando os dados corretos (nome, tipoFollowUp, etc.)
3. Verifique se há clientes que atendem aos critérios de follow-up (1, 3 ou 7 dias desde a última mensagem)

## Problema: Fuso horário incorreto

Se os timestamps estiverem sendo registrados com o fuso horário errado:

1. Execute o script SQL `configurar_fuso_horario.sql` no seu banco de dados Supabase
2. Verifique se as funções de ajuste de timestamp estão sendo usadas nos arquivos de registro de mensagens
3. Reinicie o servidor para que as alterações tenham efeito

## Problema: Mensagens não estão sendo enviadas pelo Twilio

Se as mensagens não estiverem sendo enviadas:

1. Verifique as credenciais do Twilio no n8n
2. Certifique-se de que o número do Twilio está ativo e configurado para WhatsApp
3. Verifique se o formato do número de telefone do destinatário está correto (deve incluir o código do país)

## Como testar o workflow manualmente

Para testar o workflow sem esperar pelo agendamento:

1. No n8n, abra o workflow "Follow-up Automatizado"
2. Clique no nó "Agendador Follow-up" e depois em "Execute Node"
3. Acompanhe a execução de cada nó e verifique os logs
4. Se algum nó falhar, clique nele para ver os detalhes do erro

## Logs e depuração

Para obter mais informações sobre erros:

1. No n8n, vá até "Settings" > "Log" para ver os logs do sistema
2. Verifique os logs do console do nó "Debug OpenAI" para informações específicas sobre a geração de mensagens
3. Se necessário, adicione mais nós de código com `console.log()` para depurar partes específicas do workflow