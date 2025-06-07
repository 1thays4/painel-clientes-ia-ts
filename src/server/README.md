# Servidor API para Integração com WhatsApp

Este diretório contém o código do servidor para a API de integração com WhatsApp.

## Como executar

1. Instale as dependências:
   ```
   npm install express dotenv @supabase/supabase-js
   ```

2. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_KEY=sua_chave_do_supabase
   PORT=3001
   ```

3. Execute o servidor:
   ```
   node -r ts-node/register src/server/index.ts
   ```

## Endpoints

### Registrar Mensagem
```
POST /api/registrar-mensagem
```

Corpo da requisição:
```json
{
  "cliente_id": 123,
  "conteudo": "Uso de IA no WhatsApp"
}
```

Resposta:
```json
{
  "success": true,
  "mensagens_usadas": 33,
  "mensagens_limite": 100
}
```

## Importante

Este servidor deve ser executado separadamente do frontend React.
Não tente importar este código no frontend, pois ele usa módulos Node.js que não funcionam no navegador.