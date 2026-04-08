import { createClient } from '@supabase/supabase-js';

// URL e chave do Supabase hardcoded para garantir funcionamento
const supabaseUrl = 'https://sqcedymaeazvrrgrokpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2VkeW1hZWF6dnJyZ3Jva3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc3NTUsImV4cCI6MjA2NDU3Mzc1NX0.D65rBFBiVE1F9mVI15QgJeDepEhQtPj3eS2kXxRCfB8';

// Criar cliente Supabase direto
export const supabaseDirect = createClient(supabaseUrl, supabaseKey);

// Função para login direto
export async function loginDireto(email: string, password: string) {
  try {
    console.log('Tentando login direto com:', email);
    
    const { data, error } = await supabaseDirect.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('Resposta do login direto:', { data, error });
    
    return { data, error };
  } catch (error) {
    console.error('Erro no login direto:', error);
    return { data: null, error };
  }
}