import { Request, Response } from "express";
import { supabase } from "../lib/supabase";

// Função para processar mensagens do WhatsApp

export async function processarMensagemWhatsApp(req: Request, res: Response) {
  try {
    // Extrair dados da requisição do webhook do WhatsApp
    const { message, sender, cliente_id, recipient } = req.body;

    if (!cliente_id || !message) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    // Verificar se o cliente existe e tem mensagens disponíveis
    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id, mensagens_usadas, mensagens_limite, whatsapp")
      .eq("id", cliente_id)
      .single();

    if (clienteError || !cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Verificar se existe um cliente final para este número e se o modo bot está ativo
    if (recipient) {
      const { data: clienteFinal } = await supabase
        .from("clientes_finais")
        .select("id, modo")
        .eq("cliente_id", cliente_id)
        .eq("whatsapp", recipient)
        .single();

      // Se encontrou um cliente final e o modo bot está explicitamente desativado
      if (clienteFinal && clienteFinal.modo === false) {
        console.log(
          "Modo bot desativado para o cliente final:",
          clienteFinal.id,
        );

        // Registrar a mensagem sem resposta automática
        await supabase.from("mensagens_enviadas").insert([
          {
            cliente_id,
            pergunta: message,
            timestamp: new Date().toISOString(),
            numero_remetente: sender,
            numero_destino: recipient,
            cliente_final_id: clienteFinal.id,
            whatsapp_cliente_final: recipient,
          },
        ]);

        return res.status(200).json({
          success: false,
          response:
            "O atendimento automático está desativado para este contato. Um atendente humano responderá em breve.",
          error: "Modo bot desativado",
          modo: false,
        });
      }
    }

    // Verificar limite de mensagens
    if (cliente.mensagens_usadas >= cliente.mensagens_limite) {
      // Enviar mensagem informando que o limite foi atingido
      return res.status(403).json({
        error: "Limite atingido",
        message:
          "Você atingiu o limite de mensagens deste mês. Entre em contato para fazer upgrade do seu plano.",
      });
    }

    // Aqui você chamaria sua API de IA para processar a mensagem
    // const respostaIA = await chamarModeloIA(message);
    const respostaIA =
      "Esta é uma resposta simulada da IA. Em produção, aqui seria a resposta real do modelo de IA.";

    // Registrar o uso da IA no Supabase
    const { error } = await supabase.from("mensagens_enviadas").insert([
      {
        cliente_id,
        conteudo: `Resposta para: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Erro ao registrar mensagem:", error);
      return res.status(500).json({ error: "Erro ao registrar mensagem" });
    }

    // Atualizar contador de mensagens do cliente
    await supabase
      .from("clientes")
      .update({ mensagens_usadas: cliente.mensagens_usadas + 1 })
      .eq("id", cliente_id);

    // Retornar a resposta da IA
    return res.status(200).json({
      success: true,
      response: respostaIA,
      mensagens_usadas: cliente.mensagens_usadas + 1,
      mensagens_limite: cliente.mensagens_limite,
    });
  } catch (error) {
    console.error("Erro ao processar mensagem do WhatsApp:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      message: "Desculpe, ocorreu um erro ao processar sua mensagem.",
    });
  }
}
