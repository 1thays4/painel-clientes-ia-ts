#!/bin/bash

# Script para executar o follow-up automatizado
# Coloque este arquivo no servidor Ubuntu: /home/ubuntu/followup-cron.sh

# Data e hora atual para log
echo "Executando follow-up em $(date)"

# Chamar o endpoint de verificação de follow-ups
curl -X GET http://localhost:3001/api/verificar-followups

# Registrar resultado
echo "Follow-up concluído em $(date)"