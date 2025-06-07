import { supabase } from './supabase';

// Interface para o cliente
export interface Cliente {
  id: string | number;
  nome: string;
  plano: string;
  whatsapp?: string;
  data_cadastro: string;
  status_pagamento?: "em_dia" | "pendente";
  mensagens_usadas?: number;
  mensagens_limite?: number;
  token_publico?: string;
  user_id?: string;
}

// Interface para o histórico de mensagens
export interface Mensagem {
  id: number | string;
  cliente_id?: number;
  user_id?: string;
  pergunta: string;
  resposta: string;
  timestamp: string;
}

// Buscar cliente pelo token público
export async function buscarClientePorToken(token: string): Promise<Cliente | null> {
  try {
    console.log("Buscando cliente com token:", token);
    
    // Verificar se o token é um UUID válido
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
    
    let query;
    if (isUUID) {
      // Se o token parece um UUID, tente buscar por user_id também
      query = supabase
        .from("clientes")
        .select("*")
        .or(`token_publico.eq.${token},user_id.eq.${token}`)
        .limit(1);
    } else {
      // Caso contrário, busque apenas por token_publico
      query = supabase
        .from("clientes")
        .select("*")
        .eq("token_publico", token)
        .limit(1);
    }
    
    const { data, error } = await query;
    
    console.log("Resultado da busca de cliente:", { data, error });
    
    if (error || !data || data.length === 0) {
      console.error("Erro ao buscar cliente:", error);
      
      // Criar um cliente fictício com o token como ID
      return {
        id: token, // Usando o token como ID
        nome: "Cliente",
        plano: "básico",
        data_cadastro: new Date().toISOString(),
        mensagens_limite: 100,
        mensagens_usadas: 0,
        user_id: token // Usando o token como user_id também
      };
    }
    
    // Definir valores padrão para campos importantes
    const cliente = data[0];
    if (!cliente.mensagens_limite) {
      cliente.mensagens_limite = 100; // Valor padrão
    }
    
    return cliente;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return null;
  }
}

// Atualizar dados do cliente
export async function atualizarCliente(
  id: string | number, 
  dados: { nome?: string; whatsapp?: string }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("clientes")
      .update(dados)
      .eq("id", id);
      
    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    return false;
  }
}

// Buscar histórico de mensagens do cliente
export async function buscarHistoricoMensagens(clienteId: string | number): Promise<Mensagem[]> {
  try {
    console.log('Buscando histórico para cliente ID:', clienteId);
    
    // Buscar todas as mensagens da tabela
    const { data, error } = await supabase
      .from('mensagens_enviadas')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20);
    
    console.log('Mensagens encontradas:', data?.length || 0);
    
    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}