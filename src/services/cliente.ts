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
      // Se o token parece um UUID, tente buscar por token_publico
      query = supabase
        .from("clientes")
        .select("*")
        .eq("token_publico", token)
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
    
    if (error) {
      console.error("Erro ao buscar cliente:", error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log("Cliente não encontrado para o token:", token);
      
      // Criar um cliente fictício para demonstração
      return {
        id: "demo-" + Date.now(),
        nome: "Cliente Demonstração",
        plano: "basico",
        data_cadastro: new Date().toISOString(),
        mensagens_limite: 100,
        mensagens_usadas: 0,
        token_publico: token
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
    // Se for um cliente de demonstração, simular sucesso
    if (typeof id === 'string' && id.startsWith('demo-')) {
      return true;
    }
    
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
    
    // Se for um cliente de demonstração, retornar mensagens fictícias
    if (typeof clienteId === 'string' && clienteId.startsWith('demo-')) {
      return [
        {
          id: 'demo-1',
          cliente_id: 1,
          pergunta: 'Como posso usar a IA no meu WhatsApp?',
          resposta: 'Para usar a IA no WhatsApp, basta enviar uma mensagem para o número cadastrado com o prefixo "IA:".',
          timestamp: new Date().toISOString()
        },
        {
          id: 'demo-2',
          cliente_id: 1,
          pergunta: 'Quantas mensagens posso enviar por mês?',
          resposta: 'No plano básico, você tem direito a 100 mensagens por mês. Para mais mensagens, considere fazer upgrade para um plano superior.',
          timestamp: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
        }
      ];
    }
    
    // Buscar diretamente pelo cliente_id
    const { data, error } = await supabase
      .from('mensagens_enviadas')
      .select('*')
      .eq('cliente_id', clienteId)
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

// Criar um novo cliente associado a um usuário
export async function criarCliente(
  userData: { 
    nome: string; 
    plano?: string;
    whatsapp?: string;
  }
): Promise<Cliente | null> {
  try {
    // Gerar um token público aleatório
    const tokenPublico = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
    
    // Incluir apenas os campos que existem na tabela
    const novoCliente = {
      nome: userData.nome,
      plano: userData.plano || "basico",
      whatsapp: userData.whatsapp || "",
      data_cadastro: new Date().toISOString(),
      token_publico: tokenPublico
    };
    
    const { data, error } = await supabase
      .from("clientes")
      .insert([novoCliente])
      .select()
      .single();
    
    if (error) {
      console.error("Erro ao criar cliente:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return null;
  }
}