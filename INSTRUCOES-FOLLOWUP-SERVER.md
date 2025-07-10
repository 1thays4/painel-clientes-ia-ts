# Instruções para Implementar o Servidor de Follow-up

Este documento contém instruções para implementar o servidor de follow-up no seu ambiente Docker.

## O que este servidor faz

O servidor de follow-up verifica automaticamente se há clientes que não tiveram interações nas últimas 24 horas e os marca para follow-up. Ele:

1. Busca mensagens enviadas há mais de 24 horas
2. Identifica clientes finais que precisam de follow-up
3. Atualiza o status desses clientes para "em aberto"
4. Executa esta verificação automaticamente todos os dias às 9:00
5. Fornece um endpoint `/api/verificar-followups` para verificação manual

## Implementação no Servidor

### 1. Copiar o arquivo para o servidor

```bash
# No seu computador local
scp supabase-server-followup.js ubuntu@n8n-server:~/
```

### 2. Copiar o arquivo para o container Docker

```bash
# No servidor ubuntu@n8n-server:~$
docker cp supabase-server-followup.js n8n-supabase-server-1:/app/
```

### 3. Instalar dependências necessárias

```bash
# No servidor ubuntu@n8n-server:~$
docker exec n8n-supabase-server-1 npm install node-cron
```

### 4. Iniciar o servidor de follow-up

```bash
# No servidor ubuntu@n8n-server:~$
docker exec -d n8n-supabase-server-1 node /app/supabase-server-followup.js
```

### 5. Verificar se o servidor está funcionando

```bash
# No servidor ubuntu@n8n-server:~$
curl http://localhost:3001/api/teste
```

Você deve ver uma resposta como:
```json
{"message":"Servidor de follow-up funcionando corretamente"}
```

### 6. Configurar para iniciar automaticamente

Para garantir que o servidor de follow-up seja iniciado automaticamente quando o container for reiniciado, adicione o comando ao script de inicialização do container ou crie um script de inicialização:

```bash
# No servidor ubuntu@n8n-server:~$
cat > ~/iniciar-followup.sh << 'EOF'
#!/bin/bash
echo "Aguardando 30 segundos para o container iniciar completamente..."
sleep 30
echo "Iniciando servidor de follow-up..."
docker exec -d n8n-supabase-server-1 node /app/supabase-server-followup.js
echo "Servidor de follow-up iniciado!"
EOF

chmod +x ~/iniciar-followup.sh
```

Adicione este script ao crontab para ser executado na inicialização:

```bash
# No servidor ubuntu@n8n-server:~$
(crontab -l 2>/dev/null; echo "@reboot /home/ubuntu/iniciar-followup.sh >> /home/ubuntu/followup-init.log 2>&1") | crontab -
```

## Testando o Follow-up

### Verificação Manual

Para verificar manualmente se há clientes que precisam de follow-up:

```bash
# No servidor ubuntu@n8n-server:~$
curl http://localhost:3001/api/verificar-followups
```

### Logs

Para verificar os logs do servidor de follow-up:

```bash
# No servidor ubuntu@n8n-server:~$
docker logs n8n-supabase-server-1 | grep "follow-up"
```

## Integração com o n8n

Agora que os clientes são marcados automaticamente para follow-up, o workflow do n8n pode buscar esses clientes e enviar as mensagens de follow-up.

1. No n8n, configure o workflow para buscar clientes com `modo = 'em aberto'`
2. Use o webhook que você já configurou para acionar o workflow
3. O cron job que você configurou anteriormente continuará funcionando para acionar o workflow