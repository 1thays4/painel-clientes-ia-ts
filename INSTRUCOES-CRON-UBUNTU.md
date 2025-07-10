# Configuração do Cron para Follow-up no Servidor Ubuntu

Siga estas instruções para configurar o cron job de follow-up no seu servidor Ubuntu que está executando os containers Docker.

## 1. Transferir o script para o servidor

Copie o arquivo `scripts/followup-cron.sh` para o seu servidor Ubuntu:

```bash
scp scripts/followup-cron.sh ubuntu@n8n-server:~/followup-cron.sh
```

## 2. Configurar permissões

Conecte-se ao servidor e configure as permissões do script:

```bash
ssh ubuntu@n8n-server
chmod +x ~/followup-cron.sh
```

## 3. Testar o script manualmente

Execute o script manualmente para verificar se funciona:

```bash
~/followup-cron.sh
```

Você deve ver uma saída indicando que o endpoint foi chamado.

## 4. Configurar o cron job

Edite o crontab do usuário ubuntu:

```bash
crontab -e
```

Adicione a seguinte linha para executar o script todos os dias às 10:00:

```
0 10 * * * /home/ubuntu/followup-cron.sh >> /home/ubuntu/followup.log 2>&1
```

Salve e feche o editor.

## 5. Verificar o status do cron

Verifique se o cron está ativo:

```bash
systemctl status cron
```

## 6. Monitorar os logs

Para verificar se o cron está sendo executado corretamente, você pode verificar o arquivo de log:

```bash
tail -f ~/followup.log
```

## Solução de problemas

Se o cron não estiver funcionando:

1. Verifique se o serviço cron está em execução:
   ```bash
   sudo systemctl status cron
   ```

2. Verifique se o script tem permissões de execução:
   ```bash
   ls -la ~/followup-cron.sh
   ```

3. Verifique se o container do servidor está acessível na porta 3001:
   ```bash
   curl http://localhost:3001/api/health
   ```

4. Verifique os logs do sistema para erros relacionados ao cron:
   ```bash
   sudo grep CRON /var/log/syslog
   ```