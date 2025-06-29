-- Configurar o fuso horário padrão para o banco de dados
ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';

-- Verificar a configuração atual
SHOW timezone;

-- Configurar o fuso horário para a sessão atual
SET timezone TO 'America/Sao_Paulo';

-- Função para converter timestamps para o fuso horário correto
CREATE OR REPLACE FUNCTION converter_para_fuso_local(timestamp_utc TIMESTAMP WITH TIME ZONE)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
  RETURN timestamp_utc AT TIME ZONE 'America/Sao_Paulo';
END;
$$ LANGUAGE plpgsql;

-- Atualizar os timestamps existentes (opcional)
UPDATE mensagens_enviadas
SET timestamp = converter_para_fuso_local(timestamp)
WHERE timestamp IS NOT NULL;

-- Criar um trigger para garantir que novos registros usem o fuso horário correto
CREATE OR REPLACE FUNCTION ajustar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.timestamp = NEW.timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger na tabela mensagens_enviadas
DROP TRIGGER IF EXISTS trg_ajustar_timestamp ON mensagens_enviadas;
CREATE TRIGGER trg_ajustar_timestamp
BEFORE INSERT ON mensagens_enviadas
FOR EACH ROW
EXECUTE FUNCTION ajustar_timestamp();