import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Criar e exportar o cliente Supabase
export const supabase = createClient(config.supabase.url, config.supabase.key);