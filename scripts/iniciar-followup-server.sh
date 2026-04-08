#!/bin/bash

# Script para iniciar o servidor de follow-up no container Docker
echo "Iniciando servidor de follow-up..."

# Copiar o arquivo para o container
docker cp ../supabase-server-followup.js n8n-supabase-server-1:/app/supabase-server-followup.js

# Instalar dependências necessárias (se ainda não estiverem instaladas)
docker exec n8n-supabase-server-1 npm install node-cron

# Iniciar o servidor em segundo plano
docker exec -d n8n-supabase-server-1 node /app/supabase-server-followup.js

echo "Servidor de follow-up iniciado!"