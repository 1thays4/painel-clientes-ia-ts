# Servidor API para Painel de Clientes IA

Este é o servidor API para o Painel de Clientes IA, responsável por processar as requisições de integração com WhatsApp e controle de uso.

## Configuração

1. Copie os arquivos necessários para um diretório separado:
   ```
   mkdir painel-clientes-ia-server
   cp server.js src/server/* .env .env.example server-package.json painel-clientes-ia-server/
   cd painel-clientes-ia-server
   mv server-package.json package.json
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_KEY=sua_chave_do_supabase
   PORT=3001
   ```

4. Execute o servidor:
   ```
   npm start
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

## Desenvolvimento

Para desenvolvimento com recarga automática:
```
npm run dev
```