
import { supabase } from '../lib/supabase';
import { config } from '../config';
import axios from 'axios';

interface WhatsAppMessage {
  Body: string;
  From: string;
  ProfileName?: string;
  WaId: string;
}

interface IAResponse {
  success: boolean;
  response: string;
  mensagens_usadas?: number;
  mensagens_limite?: number;
  error?: string;
}

export async function consultarIA(mensagem: WhatsAppMessage): Promise<IAResponse> {
  try {
    // Extrair número do WhatsApp (remover prefixo "whatsapp:")
    const whatsappNumero = mensagem.From.replace('whatsapp:', '');
    
    // Buscar cliente pelo número de WhatsApp
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, mensagens_usadas, mensagens_limite, whatsapp')
      .eq('whatsapp', whatsappNumero)
      .single();

    if (clienteError || !cliente) {
      console.log('Cliente não encontrado para o número:', whatsappNumero);
      return { 
        success: false, 
        response: 'Seu número não está cadastrado em nosso sistema. Entre em contato para ativar o serviço.',
        error: 'Cliente não encontrado'
      };
    }

    // Verificar limite de mensagens
    if (cliente.mensagens_usadas >= cliente.mensagens_limite) {
      return { 
        success: false, 
        response: 'Você atingiu o limite de mensagens deste mês. Entre em contato para fazer upgrade do seu plano.',
        error: 'Limite atingido'
      };
    }

    // Chamar API de IA com a mensagem recebida
    const respostaIA = await chamarModeloIA(mensagem.Body);
    
    // Registrar o uso da IA no Supabase
    const { error } = await supabase.from('mensagens_enviadas').insert([
      {
        cliente_id: cliente.id,
        conteudo: `WhatsApp: ${mensagem.Body.substring(0, 50)}${mensagem.Body.length > 50 ? '...' : ''}`,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Erro ao registrar mensagem:', error);
      return { 
        success: false, 
        response: 'Ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.',
        error: 'Erro ao registrar mensagem'
      };
    }

    // Atualizar contador de mensagens do cliente
    const novoTotal = cliente.mensagens_usadas + 1;
    await supabase
      .from('clientes')
      .update({ mensagens_usadas: novoTotal })
      .eq('id', cliente.id);

    // Retornar a resposta da IA
    return { 
      success: true,
      response: respostaIA,
      mensagens_usadas: novoTotal,
      mensagens_limite: cliente.mensagens_limite
    };
    
  } catch (error) {
    console.error('Erro ao consultar IA:', error);
    return { 
      success: false, 
      response: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
      error: 'Erro interno'
    };
  }
}

// Função para chamar o modelo de IA
async function chamarModeloIA(mensagem: string): Promise<string> {
  try {
    // Substitua pela sua API de IA (OpenAI, Claude, etc.)
    const response = await axios.post(
      config.IA_API_URL || 'https://api.openai.com/v1/chat/completions',
      {
        model: config.IA_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é um assistente virtual útil e amigável.' },
          { role: 'user', content: mensagem }
        ],
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${config.IA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extrair a resposta da IA
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao chamar modelo de IA:', error);
    return 'Desculpe, não consegui processar sua solicitação no momento. Tente novamente mais tarde.';
  }
}