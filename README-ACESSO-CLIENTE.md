# Sistema de Acesso para Clientes

## Visão Geral

Foi implementado um sistema de autenticação para o painel de clientes, garantindo que apenas pessoas autorizadas possam acessar os dados e informações do cliente.

## Como Funciona

1. Quando você compartilha o link do painel com um cliente, ele agora é redirecionado para uma tela de login
2. O cliente precisa inserir uma senha de acesso para visualizar seu painel
3. A senha é definida pelo administrador do sistema através do botão "Gerenciar Senha" no card do cliente
4. Após autenticação bem-sucedida, o cliente tem acesso ao seu painel personalizado

## Configuração de Senhas

### Para Administradores

1. Na lista de clientes, clique no botão "Gerenciar Senha" para o cliente desejado
2. Você pode:
   - Digitar uma senha manualmente
   - Usar o botão "Gerar Senha Aleatória" para criar uma senha de 6 dígitos
3. Clique em "Salvar Senha" para confirmar
4. Informe ao cliente a senha de acesso por um canal seguro (email, WhatsApp, etc.)

### Para Clientes

1. O cliente recebe um link para o painel (ex: `https://seusite.com/cliente-login/TOKEN`)
2. Ao acessar o link, é solicitada a senha de acesso
3. Após inserir a senha correta, o cliente é redirecionado para seu painel personalizado
4. A sessão é mantida no navegador, permitindo acessos futuros sem necessidade de nova autenticação

## Segurança

- As senhas são armazenadas no banco de dados
- A autenticação é baseada em sessão do navegador
- O token do cliente é necessário para acessar o painel, mesmo com a senha correta
- Recomenda-se trocar as senhas periodicamente para maior segurança

## Banco de Dados

Foi adicionada uma nova coluna `senha_acesso` à tabela `clientes` para armazenar as senhas de acesso. O script SQL para esta alteração está disponível em:

```
supabase/add_senha_acesso_clientes.sql
```

## Próximos Passos

Para aumentar ainda mais a segurança, considere implementar:

1. Criptografia das senhas no banco de dados
2. Expiração de sessão após período de inatividade
3. Histórico de acessos para auditoria
4. Opção para o cliente alterar sua própria senha