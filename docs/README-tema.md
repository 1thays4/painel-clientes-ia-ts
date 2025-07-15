# Tema Centralizado para o Painel de Clientes IA

Este documento descreve a implementação do tema centralizado para o projeto Painel de Clientes IA, que visa melhorar a manutenção e consistência visual da aplicação.

## O que foi implementado

1. **Tema centralizado**: Criamos um arquivo de tema em `src/theme/index.ts` que define todas as cores, tipografia e estilos de componentes.

2. **Cores customizadas para chatbot**: Adicionamos uma seção `custom` ao tema para cores específicas do chatbot.

3. **Guia de migração**: Criamos um guia detalhado em `docs/guia-migracao-tema.md` para ajudar a equipe a migrar de cores hardcoded para o tema.

4. **Script de detecção**: Implementamos um script em `scripts/encontrar-cores-hardcoded.js` para identificar cores hardcoded no projeto.

5. **Componente de exemplo**: Criamos um componente de exemplo em `src/components/ExemploComponente.tsx` que demonstra como usar o tema.

## Benefícios do tema centralizado

- **Consistência visual**: Todas as cores são definidas em um único lugar, garantindo consistência em toda a aplicação.
- **Facilidade de manutenção**: Alterar uma cor em toda a aplicação requer apenas uma mudança no arquivo de tema.
- **Suporte a temas**: Facilita a implementação de temas claros/escuros ou personalizados por cliente.
- **Melhor organização**: Separa a lógica de estilo da lógica de componente.

## Boas práticas para organização do tema em um projeto de chatbots com IA

1. **Separação por contexto**: Organize as cores por contexto de uso (interface, mensagens, alertas, etc.).

2. **Nomenclatura semântica**: Use nomes que descrevem o propósito da cor, não sua aparência (ex: `success` em vez de `green`).

3. **Hierarquia de cores**: Defina cores primárias, secundárias e variações para criar uma hierarquia visual clara.

4. **Cores específicas para IA**: Crie uma seção dedicada para elementos relacionados à IA, como:
   - Cores para mensagens do usuário vs. mensagens do bot
   - Indicadores de processamento de IA
   - Cores para diferentes tipos de respostas (informativa, alerta, erro)

5. **Acessibilidade**: Garanta que as combinações de cores atendam aos padrões de acessibilidade (contraste, legibilidade).

6. **Documentação**: Mantenha a documentação atualizada sobre o propósito de cada cor e quando usá-la.

## Próximos passos

1. **Migração gradual**: Use o script de detecção para identificar e migrar gradualmente todas as cores hardcoded.

2. **Expansão do tema**: Adicione mais tokens de design conforme necessário (espaçamento, bordas, etc.).

3. **Testes visuais**: Implemente testes visuais para garantir consistência após mudanças no tema.

4. **Tema escuro**: Considere implementar um tema escuro usando o mesmo sistema.

5. **Documentação de design**: Crie uma documentação de design que mostre como usar o tema corretamente.

## Como usar o script de detecção

```bash
node scripts/encontrar-cores-hardcoded.js
```

Este comando irá escanear o projeto e listar todos os arquivos que contêm cores hardcoded, ajudando a identificar onde as mudanças são necessárias.