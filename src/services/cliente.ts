import { supabase } from './supabase';

// Interface para o cliente
export interface Cliente {
  id: number;
  nome: string;
  plano: string;
  whatsapp?: string;
  data_cadastro: string;
  status_pagamento?: "em_dia" | "pendente";
  mensagens_usadas?: number;
  mensagens_limite?: number;
  token_publico?: string;
}

// Interface para o histórico de mensagens
export interface Mensagem {
  id: number;
  cliente_id: number;
  pergunta: string;
  resposta: string;
  timestamp: string;
}

// Buscar cliente pelo token público
export async function buscarClientePorToken(token: string): Promise<Cliente | null> {
  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("token_publico", token)
      .single();
      
    if (error || !data) {
      console.error("Erro ao buscar cliente:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return null;
  }
}

// Atualizar dados do cliente
export async function atualizarCliente(
  id: number, 
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
export async function buscarHistoricoMensagens(clienteId: number): Promise<Mensagem[]> {
  try {
    const { data, error } = await supabase
      .from("mensagens_enviadas")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("timestamp", { ascending: false });
      
    if (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }
}