# Instruções para Produção

Para garantir que o login funcione corretamente em produção, siga estas instruções:

## 1. Configuração do Supabase

1. Acesse o painel do Supabase (https://app.supabase.com)
2. Vá para o projeto "painel-clientes-ia"
3. Em "Authentication" > "Providers", verifique se o Email provider está habilitado
4. Em "Authentication" > "URL Configuration", configure:
   - Site URL: URL do seu site em produção (ex: https://seu-dominio.com)
   - Redirect URLs: Adicione https://seu-dominio.com/auth/callback

## 2. Criação de Usuários

Para criar usuários que possam fazer login:

1. No painel do Supabase, vá para "Authentication" > "Users"
2. Clique em "Invite user" e adicione o email do usuário
3. O usuário receberá um email para definir sua senha

Alternativamente, você pode usar o método de login com link mágico, que enviará um link de acesso por email.

## 3. Variáveis de Ambiente

As variáveis de ambiente já estão configuradas no arquivo `.env.production`. Se precisar alterar:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_KEY=sua_chave_do_supabase
```

## 4. Build e Deploy

Para fazer o build e deploy da aplicação:

```bash
# Build da aplicação
npm run build

# Iniciar em produção
npm start
```

## 5. Verificação

Após o deploy, verifique se:

1. A página de login está acessível
2. O login com email/senha funciona
3. O login com link mágico envia o email corretamente
4. Após o login, o usuário é redirecionado para o painel

Se encontrar problemas, verifique os logs do servidor e do console do navegador para identificar erros específicos.