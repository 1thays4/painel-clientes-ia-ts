# Painel de Atendimento Humano

Este módulo permite que você visualize e responda manualmente às mensagens dos seus clientes em "modo humano".

## Funcionalidades

- Visualização de todas as mensagens dos clientes
- Interface para responder manualmente às mensagens
- Exibição de respostas da IA e respostas humanas
- Notificações em tempo real de novas mensagens

## Configuração

### 1. Atualizar a estrutura do banco de dados

Execute o script SQL em `supabase/update_mensagens_table_resposta_humana.sql` para adicionar a coluna `resposta_humana` à tabela de mensagens.

```sql
-- Adicionar coluna resposta_humana à tabela mensagens_enviadas
ALTER TABLE mensagens_enviadas ADD COLUMN IF NOT EXISTS resposta_humana TEXT;

-- Renomear coluna conteudo para pergunta (se necessário)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'mensagens_enviadas' 
    AND column_name = 'conteudo'
  ) THEN
    ALTER TABLE mensagens_enviadas RENAME COLUMN conteudo TO pergunta;
  END IF;
END $$;
```

### 2. Como usar o painel de respostas humanas

O painel de respostas humanas está integrado diretamente no painel do cliente, substituindo o antigo histórico de mensagens.

1. Acesse o painel do cliente normalmente
2. Na seção de mensagens, você verá uma interface dividida em duas partes:
   - À esquerda: Lista de todas as mensagens
   - À direita: Área para responder manualmente

3. Para responder a uma mensagem:
   - Clique na mensagem desejada na lista
   - Digite sua resposta no campo de texto
   - Clique em "Enviar Resposta"

4. As respostas humanas serão exibidas em verde para diferenciá-las das respostas da IA

## Notas importantes

- As mensagens são exibidas em ordem cronológica inversa (mais recentes primeiro)
- Você receberá notificações em tempo real quando novas mensagens chegarem
- Você pode responder a qualquer mensagem, mesmo que já tenha uma resposta da IA
- As respostas humanas complementam as respostas da IA, não as substituem