-- Add follow-up related columns to clientes_finais table
ALTER TABLE public.clientes_finais 
ADD COLUMN IF NOT EXISTS ultimo_followup timestamp with time zone,
ADD COLUMN IF NOT EXISTS proximo_followup timestamp with time zone,
ADD COLUMN IF NOT EXISTS tentativas_followup integer DEFAULT 0;

-- Update the modo column to include follow-up statuses
-- This assumes the modo column already exists
COMMENT ON COLUMN public.clientes_finais.modo IS 'Status do cliente: bot, humano, em aberto, encerrado';

-- Create an index for faster queries on the modo column
CREATE INDEX IF NOT EXISTS idx_clientes_finais_modo ON public.clientes_finais (modo);

-- Create a function to automatically set the next follow-up date based on last message
CREATE OR REPLACE FUNCTION set_next_followup()
RETURNS TRIGGER AS $$
DECLARE
  ultima_mensagem RECORD;
BEGIN
  -- If modo is 'em aberto', set the next follow-up date
  IF NEW.modo = 'em aberto' THEN
    -- Get the last message for this client
    SELECT * INTO ultima_mensagem FROM mensagens_enviadas
    WHERE cliente_final_id = NEW.id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- If there's a last message, use its timestamp
    IF FOUND THEN
      -- If it's the first follow-up (tentativas_followup = 0), set for 1 day
      IF NEW.tentativas_followup = 0 THEN
        NEW.proximo_followup := ultima_mensagem.timestamp + INTERVAL '1 day';
      -- If it's the second follow-up (tentativas_followup = 1), set for 3 days
      ELSIF NEW.tentativas_followup = 1 THEN
        NEW.proximo_followup := ultima_mensagem.timestamp + INTERVAL '3 days';
      -- If it's the third follow-up (tentativas_followup = 2), set for 7 days
      ELSIF NEW.tentativas_followup = 2 THEN
        NEW.proximo_followup := ultima_mensagem.timestamp + INTERVAL '7 days';
      END IF;
      
      -- Increment the follow-up attempts
      NEW.tentativas_followup := COALESCE(NEW.tentativas_followup, 0) + 1;
    ELSE
      -- If no message found, use current time
      IF NEW.tentativas_followup = 0 THEN
        NEW.proximo_followup := NOW() + INTERVAL '1 day';
      ELSIF NEW.tentativas_followup = 1 THEN
        NEW.proximo_followup := NOW() + INTERVAL '3 days';
      ELSIF NEW.tentativas_followup = 2 THEN
        NEW.proximo_followup := NOW() + INTERVAL '7 days';
      END IF;
      
      -- Increment the follow-up attempts
      NEW.tentativas_followup := COALESCE(NEW.tentativas_followup, 0) + 1;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set the next follow-up date
DROP TRIGGER IF EXISTS trg_set_next_followup ON public.clientes_finais;
CREATE TRIGGER trg_set_next_followup
BEFORE UPDATE ON public.clientes_finais
FOR EACH ROW
WHEN (NEW.modo = 'em aberto')
EXECUTE FUNCTION set_next_followup();