#!/bin/bash

# Script para executar o follow-up diretamente no container Docker
# Coloque este arquivo no servidor Ubuntu: /home/ubuntu/docker-followup.sh

# Data e hora atual para log
echo "Executando follow-up via Docker em $(date)"

# Executar curl dentro do container do servidor
docker exec n8n-supabase-server-1 curl -X GET http://localhost:3001/api/verificar-followups

# Registrar resultado
echo "Follow-up via Docker concluído em $(date)"