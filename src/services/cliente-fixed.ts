import { supabase } from './supabase';
import { config } from '../config';

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
  resposta_humana?: string;
  id: number | string;
  cliente_id?: string | number; // UUID na tabela real
  user_id?: string;
  pergunta: string;
  resposta: string;
  timestamp: string;
  nome_cliente?: string;
  whatsapp_cliente?: string;
  cliente_final_id?: number;
  nome_cliente_final?: string;
  whatsapp_cliente_final?: string;
  numero_remetente?: string;
  numero_destino?: string;
}

// Buscar histórico de mensagens do cliente
export async function buscarHistoricoMensagens(clienteId: string | number | null, limite: number = 200, offset: number = 0): Promise<Mensagem[]> {
  try {
    console.log('Buscando histórico para cliente ID:', clienteId, 'limite:', limite, 'offset:', offset);
    
    // Se for um cliente de demonstração, retornar mensagens fictícias
    if (typeof clienteId === 'string' && clienteId?.startsWith('demo-')) {
      return [
        {
          id: 'demo-1',
          cliente_id: 'demo-empresa-1',
          pergunta: 'Como posso usar a IA no meu WhatsApp?',
          resposta: 'Para usar a IA no WhatsApp, basta enviar uma mensagem para o número cadastrado com o prefixo "IA:".',
          timestamp: new Date().toISOString(),
          nome_cliente: 'Empresa ABC',
          whatsapp_cliente: '5511999999999',
          cliente_final_id: 101,
          nome_cliente_final: 'João Silva',
          whatsapp_cliente_final: '5511988888888'
        },
        {
          id: 'demo-2',
          cliente_id: 'demo-empresa-1',
          pergunta: 'Quantas mensagens posso enviar por mês?',
          resposta: 'No plano básico, você tem direito a 100 mensagens por mês. Para mais mensagens, considere fazer upgrade para um plano superior.',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
          nome_cliente: 'Empresa ABC',
          whatsapp_cliente: '5511999999999',
          cliente_final_id: 102,
          nome_cliente_final: 'Maria Oliveira',
          whatsapp_cliente_final: '5511977777777'
        }
      ];
    }
    
    // Construir a consulta base
    let query = supabase
      .from('mensagens_enviadas')
      .select('*')
      .order('timestamp', { ascending: false });
    
    // Filtrar por cliente_id se fornecido
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    
    // Aplicar paginação
    query = query.range(offset, offset + limite - 1);
    
    const { data, error } = await query;
    
    console.log('Mensagens encontradas:', data?.length || 0);
    
    if (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
    
    // Buscar informações dos clientes para as mensagens encontradas
    if (data && data.length > 0) {
      // Obter IDs únicos de clientes
      const clienteIds = Array.from(new Set(data.map((msg: { cliente_id: any; }) => msg.cliente_id).filter(Boolean)));
      
      // Buscar informações dos clientes
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, nome, whatsapp')
        .in('id', clienteIds);
      
      // Criar mapa de clientes para fácil acesso
      const clientesMap: { [key: string]: { id: string | number; nome?: string; whatsapp?: string } } = {};
      if (clientesData) {
        clientesData.forEach((cliente: { id: string | number; nome?: string; whatsapp?: string }) => {
          clientesMap[String(cliente.id)] = cliente;
        });
      }
      
      // Obter IDs únicos de clientes finais
      const clienteFinaisIds = Array.from(new Set(data
        .map((msg: { cliente_final_id: any; }) => msg.cliente_final_id)
        .filter(Boolean)));
      
      console.log('clienteFinaisIds =', clienteFinaisIds);
      
      // Criar mapa de clientes finais para fácil acesso
      const clientesFinaisMap: { [key: string]: { id: string | number; nome?: string; whatsapp?: string; email?: string } } = {};
      
      // Buscar informações dos clientes finais apenas se houver IDs válidos
      if (clienteFinaisIds && clienteFinaisIds.length > 0) {
        try {
          const { data: clientesFinaisData, error: clientesFinaisError } = await supabase
            .from('clientes_finais')
            .select('id, nome, whatsapp, email')
            .in('id', clienteFinaisIds);
          
          console.log('clientesFinaisData =', clientesFinaisData);
          
          if (clientesFinaisError) {
            console.error('Erro ao buscar clientes finais:', clientesFinaisError);
          } else if (clientesFinaisData) {
            clientesFinaisData.forEach((clienteFinal: { id: string | number; nome?: string; whatsapp?: string; email?: string }) => {
              clientesFinaisMap[String(clienteFinal.id)] = clienteFinal;
            });
          }
        } catch (err) {
          console.error('Erro ao buscar clientes finais:', err);
        }
      }
      
      // Formatar os dados para corresponder à interface Mensagem
      const mensagensFormatadas = data.map((msg: any) => {
        const cliente = clientesMap[String(msg.cliente_id)] || {};
        const clienteFinal = msg.cliente_final_id ? clientesFinaisMap[String(msg.cliente_final_id)] || {} : {};
        
        // Função para limpar e validar número de WhatsApp
        const formatarNumeroWhatsApp = (numero?: string): string => {
          if (!numero) return '';
          
          // Remover todos os caracteres não numéricos
          const apenasDigitos = numero.replace(/\D/g, '');
          
          // Verificar se tem pelo menos 8 dígitos
          if (apenasDigitos.length >= 8) {
            return apenasDigitos;
          }
          
          return '';
        };
        
        const whatsappCliente = formatarNumeroWhatsApp((cliente as { whatsapp?: string }).whatsapp);
        const whatsappClienteFinal = formatarNumeroWhatsApp((clienteFinal as { whatsapp?: string })?.whatsapp);
        
        // Usar os números de remetente e destino se disponíveis
        const numeroRemetente = msg.numero_remetente || whatsappCliente;
        const numeroDestino = msg.numero_destino || whatsappClienteFinal;
        
        // Se o número de destino for igual ao número do cliente, usar o número de remetente como destino
        const numeroDestinoFinal = numeroDestino === whatsappCliente ? numeroRemetente : numeroDestino;
        
        return {
          ...msg,
          nome_cliente: (cliente as { nome?: string }).nome || 'Cliente sem nome',
          whatsapp_cliente: whatsappCliente,
          nome_cliente_final: (clienteFinal as { nome?: string })?.nome || 'Usuário final',
          whatsapp_cliente_final: numeroDestinoFinal || whatsappClienteFinal,
          numero_remetente: numeroRemetente,
          numero_destino: numeroDestinoFinal
        };
      });
      
      return mensagensFormatadas;
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}