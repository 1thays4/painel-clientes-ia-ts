import { supabase } from '../lib/supabase';
import { config } from '../config';
import { setupAuthHeaders } from '../lib/authHeaders';

// Interface para o resultado da verificação de limite
interface ResultadoVerificacao {
  mensagensUsadas: number;
  limite: number;
  disponivel: number;
}

// Registrar uma nova mensagem de IA no WhatsApp
export async function registrarMensagem(
  clienteId: string | number, 
  pergunta?: string,
  numeroRemetente?: string,
  numeroDestino?: string
): Promise<ResultadoVerificacao> {
  try {
    // Verificar se o cliente existe e tem mensagens disponíveis
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, mensagens_usadas, mensagens_limite')
      .eq('id', clienteId)
      .single();

    if (clienteError || !cliente) {
      throw new Error('Cliente não encontrado');
    }

    // Verificar limite de mensagens
    if (!cliente.mensagens_limite) {
      // Definir limite padrão baseado no plano
      const planoConfig = config.planos[cliente.plano as keyof typeof config.planos];
      cliente.mensagens_limite = planoConfig?.limite || 1000;
    }
    
    if (cliente.mensagens_usadas >= cliente.mensagens_limite) {
      throw new Error('Limite de mensagens atingido para este mês');
    }

    // Limpar e formatar números de telefone
    const formatarNumero = (numero?: string): string => {
      if (!numero) return '';
      return numero.replace(/\D/g, '');
    };

    // Registrar a mensagem
    const { error } = await supabase.from('mensagens_enviadas').insert([
      {
        cliente_id: clienteId,
        pergunta: pergunta || 'Uso de IA no WhatsApp',
        timestamp: new Date().toISOString(),
        numero_remetente: formatarNumero(numeroRemetente),
        numero_destino: formatarNumero(numeroDestino)
      },
    ]);

    if (error) {
      throw new Error('Erro ao registrar mensagem');
    }

    // Atualizar contador de mensagens do cliente
    const novoTotal = cliente.mensagens_usadas + 1;
    
    await supabase
      .from('clientes')
      .update({ mensagens_usadas: novoTotal })
      .eq('id', clienteId);

    return {
      mensagensUsadas: novoTotal,
      limite: cliente.mensagens_limite,
      disponivel: cliente.mensagens_limite - novoTotal
    };
  } catch (error) {
    console.error('Erro ao registrar mensagem:', error);
    throw error;
  }
}

// Contar mensagens do mês atual
export async function contarMensagensMes(clienteId: string | number): Promise<number> {
  // Configurar o token do cliente nos cabeçalhos
  setupAuthHeaders();
  try {
    console.log('Contando mensagens para cliente ID:', clienteId);
    
    // Se for um cliente de demonstração, retornar um valor fixo
    if (typeof clienteId === 'string' && clienteId.startsWith('demo-')) {
      return 5; // Valor fixo para demonstração
    }
    
    const now = new Date();
    // Definir hora para 00:00:00 para o primeiro dia e 23:59:59 para o último dia
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0).toISOString();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    // Contar mensagens pelo cliente_id
    const { count, error } = await supabase
      .from('mensagens_enviadas')
      .select('id', { count: 'exact' })
      .eq('cliente_id', clienteId)
      .gte('timestamp', firstDay)
      .lte('timestamp', lastDay);
    
    console.log('Mensagens do cliente neste mês:', count);
    
    if (error) {
      console.error('Erro ao contar mensagens:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Erro ao contar mensagens:', error);
    return 0;
  }
}

// Responder manualmente a uma mensagem
export async function responderManualmente(
  mensagemId: string | number,
  resposta: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mensagens_enviadas')
      .update({ resposta_humana: resposta })
      .eq('id', mensagemId);
    
    if (error) {
      console.error('Erro ao responder mensagem:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao responder mensagem:', error);
    return false;
  }
}

// Buscar mensagens pendentes de resposta humana
export async function buscarMensagensPendentes(clienteId?: string | number): Promise<any[]> {
  try {
    let query = supabase
      .from('mensagens_enviadas')
      .select('*')
      .is('resposta_humana', null)
      .order('timestamp', { ascending: false });
    
    if (clienteId) {
      query = query.eq('cliente_id', clienteId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar mensagens pendentes:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar mensagens pendentes:', error);
    return [];
  }
}