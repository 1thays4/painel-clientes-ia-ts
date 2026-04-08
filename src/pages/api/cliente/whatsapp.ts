import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { whatsapp } = req.query;

    if (!whatsapp) {
      return res
        .status(400)
        .json({ error: "Número de WhatsApp é obrigatório" });
    }

    // Limpar o número (remover formatação)
    const whatsappLimpo = String(whatsapp).replace(/\\D/g, "");

    // Buscar cliente pelo número de WhatsApp
    const { data, error } = await supabase
      .from("clientes")
      .select(
        "id, nome, plano, mensagens_usadas, mensagens_limite, status_pagamento",
      )
      .eq("whatsapp", whatsappLimpo)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    return res.status(200).json({
      cliente_id: data.id,
      nome: data.nome,
      plano: data.plano,
      mensagens_usadas: data.mensagens_usadas,
      mensagens_limite: data.mensagens_limite,
      status_pagamento: data.status_pagamento,
    });
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
