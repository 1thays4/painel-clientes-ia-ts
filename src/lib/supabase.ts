import { createClient } from '@supabase/supabase-js';

// URL e chave do Supabase hardcoded para garantir funcionamento
// Tenta usar as variáveis de ambiente primeiro, mas tem fallback para valores hardcoded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                  process.env.REACT_APP_SUPABASE_URL || 
                  'https://sqcedymaeazvrrgrokpv.supabase.co';

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || 
                   process.env.REACT_APP_SUPABASE_KEY || 
                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2VkeW1hZWF6dnJyZ3Jva3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc3NTUsImV4cCI6MjA2NDU3Mzc1NX0.D65rBFBiVE1F9mVI15QgJeDepEhQtPj3eS2kXxRCfB8';

console.log('Inicializando Supabase com URL:', supabaseUrl);

// Opções de configuração
const options = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'x-application-name': 'painel-clientes-ia' },
  }
};

// Criar e exportar o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Verificar a conexão com o Supabase
/* supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Conexão com Supabase estabelecida com sucesso');
  }
}); */

// Verificar a conexão com o Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Conexão com Supabase estabelecida com sucesso');
  } else if (event === 'SIGNED_OUT') {
    console.log('Desconectado do Supabase');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token do Supabase atualizado');
  } else if (event === 'USER_UPDATED') {
    console.log('Dados do usuário atualizados');
  }
});

// Função para verificar a conexão com o Supabase
export async function verificarConexaoSupabase() {
  try {
    const { data, error } = await supabase.from('clientes').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Erro ao verificar conexão com o Supabase:', error);
      return false;
    }
    
    console.log('Conexão com o Supabase verificada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao verificar conexão com o Supabase:', error);
    return false;
  }
}