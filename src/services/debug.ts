import { supabase } from './supabase';

// Função para verificar a estrutura da tabela mensagens_enviadas
export async function verificarEstruturaMensagens() {
  try {
    // Verificar a estrutura da tabela
    const { data, error } = await supabase
      .from('mensagens_enviadas')
      .select('*')
      .limit(1);
    
    console.log('Estrutura da tabela mensagens_enviadas:', data);
    
    if (error) {
      console.error('Erro ao verificar estrutura:', error);
      return null;
    }
    
    // Verificar se há dados na tabela
    const { count, error: countError } = await supabase
      .from('mensagens_enviadas')
      .select('*', { count: 'exact' });
    
    console.log('Total de mensagens na tabela:', count);
    
    if (countError) {
      console.error('Erro ao contar mensagens:', countError);
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao verificar estrutura:', error);
    return null;
  }
}

// Função para verificar a estrutura da tabela clientes
export async function verificarEstruturaClientes() {
  try {
    // Verificar a estrutura da tabela
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .limit(1);
    
    console.log('Estrutura da tabela clientes:', data);
    
    if (error) {
      console.error('Erro ao verificar estrutura:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao verificar estrutura:', error);
    return null;
  }
}

// Função para buscar mensagens por user_id
export async function buscarMensagensPorUserId(userId: string) {
  try {
    const { data, error } = await supabase
      .from('mensagens_enviadas')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
    
    console.log(`Mensagens para user_id ${userId}:`, data);
    
    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return null;
  }
}