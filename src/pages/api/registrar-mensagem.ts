import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { config } from '../../config';
import { formatarTimestampComFuso } from '../../utils/ajustarTimestamp';

interface MensagemRequest {
  whatsappNumero: string;
  pergunta: string;
  resposta: string;
  numeroDestino?: string;
  numeroRemetente?: string;
  numero_remetente?: string;
  numero_destino?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  console.log('🔍 DEBUG: Iniciando registrarMensagemWhatsApp');
  console.log('🔍 DEBUG: Corpo da requisição:', JSON.stringify(req.body, null, 2));
  
  try {
    // Verificar se a configuração da API está completa
    if (!config.IA_API_KEY || config.IA_API_KEY === 'your-openai-api-key-here') {
      console.error('❌ DEBUG: Configuração da API de IA incompleta');
      return res.status(500).json({ error: 'Configuração do sistema incompleta' });
    }

    const { whatsappNumero, pergunta, resposta, numeroRemetente, numeroDestino, numero_remetente, numero_destino }: MensagemRequest = req.body;
    
    console.log('🔍 DEBUG: Dados extraídos:', { 
      whatsappNumero, 
      pergunta: pergunta?.substring(0, 50) + '...', 
      resposta: resposta?.substring(0, 50) + '...',
      numeroRemetente,
      numeroDestino,
      numero_remetente,
      numero_destino
    });
    
    if (!whatsappNumero || !pergunta || !resposta) {
      console.error('❌ DEBUG: Dados incompletos');
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    // Limpar o número de WhatsApp (remover prefixo "whatsapp:" se existir)
    const numeroLimpo = whatsappNumero.replace('whatsapp:', '');
    console.log('🔍 DEBUG: Número limpo:', numeroLimpo);
    
    // Buscar cliente pelo número de WhatsApp
    console.log('🔍 DEBUG: Buscando cliente pelo número:', numeroLimpo);
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, mensagens_usadas, mensagens_limite')
      .eq('whatsapp', numeroLimpo)
      .single();

    if (clienteError) {
      console.error('❌ DEBUG: Erro ao buscar cliente:', clienteError);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    if (!cliente) {
      console.error('❌ DEBUG: Cliente não encontrado para o número:', numeroLimpo);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    console.log('✅ DEBUG: Cliente encontrado:', cliente);

    // Formatar números de telefone
    const formatarNumero = (numero?: string): string => {
      if (!numero) return '';
      return numero.replace(/\\D/g, '');
    };

    const numeroRemetenteFormatado = formatarNumero(numero_remetente || numeroRemetente || numeroLimpo);
    const numeroDestinoFormatado = formatarNumero(numero_destino || numeroDestino || '');
    
    console.log('🔍 DEBUG: Números formatados:', { 
      numeroRemetenteFormatado, 
      numeroDestinoFormatado 
    });

    // Registrar a mensagem com timestamp ajustado para o fuso horário brasileiro
    console.log('🔍 DEBUG: Registrando mensagem no banco de dados');
    const timestampAjustado = formatarTimestampComFuso();
    console.log('🔍 DEBUG: Timestamp ajustado para fuso BR:', timestampAjustado);
    
    const { data: mensagemInserida, error } = await supabase.from('mensagens_enviadas').insert([
      {
        cliente_id: cliente.id,
        pergunta: pergunta,
        resposta: resposta,
        timestamp: timestampAjustado,
        numero_remetente: numeroRemetenteFormatado,
        numero_destino: numeroDestinoFormatado
      },
    ]).select();

    if (error) {
      console.error('❌ DEBUG: Erro ao registrar mensagem:', error);
      return res.status(500).json({ error: 'Erro ao registrar mensagem' });
    }

    console.log('✅ DEBUG: Mensagem registrada com sucesso:', mensagemInserida);

    // Atualizar contador de mensagens do cliente
    const novoTotal = cliente.mensagens_usadas + 1;
    console.log('🔍 DEBUG: Atualizando contador de mensagens para:', novoTotal);
    
    const { error: updateError } = await supabase
      .from('clientes')
      .update({ mensagens_usadas: novoTotal })
      .eq('id', cliente.id);
      
    if (updateError) {
      console.error('❌ DEBUG: Erro ao atualizar contador de mensagens:', updateError);
    } else {
      console.log('✅ DEBUG: Contador de mensagens atualizado com sucesso');
    }

    console.log('✅ DEBUG: Processo concluído com sucesso');
    return res.status(200).json({
      success: true,
      mensagens_usadas: novoTotal,
      mensagens_limite: cliente.mensagens_limite,
      disponivel: cliente.mensagens_limite - novoTotal
    });
  } catch (error) {
    console.error('❌ DEBUG: Erro não tratado:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}