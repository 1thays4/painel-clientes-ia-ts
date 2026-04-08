# API para Integração com WhatsApp

Este diretório contém o código da API para integração com WhatsApp e controle de uso de IA.

## Importante

Este código é destinado a ser executado em um ambiente Node.js separado, não no navegador.
Para desenvolvimento frontend, use apenas os componentes React.

## Como executar a API

1. Crie um projeto Node.js separado
2. Copie os arquivos deste diretório
3. Instale as dependências:
   ```
   npm install express @supabase/supabase-js dotenv
   ```
4. Configure as variáveis de ambiente
5. Execute o servidor:
   ```
   node index.js
   ```

## Endpoints

- `POST /api/webhook/whatsapp` - Webhook para receber mensagens do WhatsApp
- `GET /api/cliente/whatsapp` - Buscar cliente pelo número de WhatsApp
- `POST /api/registrar-mensagem` - Registrar uso de IA