# Segurança do Link Mágico

## Visão Geral

O sistema de autenticação por "Link Mágico" permite que usuários façam login sem senha, recebendo um link de acesso por email. Para garantir a segurança deste método, implementamos restrições que permitem apenas emails autorizados a utilizar esta funcionalidade.

## Como Funciona

1. O usuário insere seu email na tela de login e seleciona a opção "Link Mágico"
2. O sistema verifica se o email está na lista de emails autorizados
3. Se autorizado, um link único e temporário é enviado para o email do usuário
4. O usuário clica no link recebido e é autenticado automaticamente

## Configuração de Emails Autorizados

Os emails autorizados são configurados no arquivo `src/utils/emailValidator.ts` de duas formas:

### 1. Domínios Autorizados

Você pode autorizar todos os emails de determinados domínios:

```typescript
const AUTHORIZED_DOMAINS = [
  'empresa.com',
  'cliente.com',
  // Adicione outros domínios autorizados aqui
];
```

### 2. Emails Específicos

Você pode autorizar emails específicos:

```typescript
const AUTHORIZED_EMAILS = [
  'admin@example.com',
  'suporte@example.com',
  // Adicione outros emails autorizados aqui
];
```

## Recomendações de Segurança Adicionais

Para aumentar ainda mais a segurança do sistema de Link Mágico, considere:

1. **Expiração do Link**: Configure o link para expirar após um curto período (ex: 15 minutos)
2. **Uso Único**: Garanta que o link só possa ser usado uma vez
3. **Registro de Tentativas**: Monitore e registre tentativas de acesso não autorizadas
4. **Notificações**: Envie notificações ao usuário quando um link mágico for solicitado

## Implementação Técnica

A verificação de emails autorizados é feita pela função `isAuthorizedEmail()` no arquivo `src/utils/emailValidator.ts`. Esta função é chamada antes de enviar o link mágico, garantindo que apenas usuários autorizados recebam o link de acesso.