import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Verificar se as credenciais do Supabase estão disponíveis
if (!config.supabase.url || !config.supabase.key) {
  console.error('Erro: Credenciais do Supabase não configuradas. Verifique as variáveis de ambiente.');
}

// Criar e exportar o cliente Supabase
export const supabase = createClient(
  config.supabase.url || '',
  config.supabase.key || ''
);