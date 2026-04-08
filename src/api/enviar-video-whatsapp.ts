import { Request, Response } from "express";
import { supabase } from "../lib/supabase";

export async function enviarVideoWhatsApp(req: Request, res: Response) {
  try {
    const { whatsappNumero, videoUrl, mensagem } = req.body;

    if (!whatsappNumero || !videoUrl) {
      return res
        .status(400)
        .json({
          error:
            "Dados incompletos. Número WhatsApp e URL do vídeo são obrigatórios.",
        });
    }

    // Formatar o número do WhatsApp se necessário
    const numeroFormatado = whatsappNumero.startsWith("+")
      ? whatsappNumero
      : `+${whatsappNumero}`;

    // Preparar dados para o n8n enviar o vídeo
    const dadosVideo = {
      numeroDestino: numeroFormatado,
      numeroRemetente: process.env.TWILIO_WHATSAPP_NUMBER || "+554791950615",
      videoUrl: videoUrl,
      mensagem: mensagem || "Aqui está o vídeo que você solicitou!",
    };

    // Registrar o envio do vídeo no banco de dados
    const { error } = await supabase.from("mensagens_enviadas").insert([
      {
        whatsapp_numero: numeroFormatado,
        conteudo: `Vídeo enviado: ${videoUrl}`,
        tipo_conteudo: "video",
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Erro ao registrar envio de vídeo:", error);
    }

    // Retornar os dados para o n8n processar
    return res.status(200).json({
      success: true,
      dados: dadosVideo,
    });
  } catch (error) {
    console.error("Erro ao processar solicitação de vídeo:", error);
    return res.status(500).json({
      error: "Erro interno do servidor",
      message:
        "Desculpe, ocorreu um erro ao processar sua solicitação de vídeo.",
    });
  }
}
