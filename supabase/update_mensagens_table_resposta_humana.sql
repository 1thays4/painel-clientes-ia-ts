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