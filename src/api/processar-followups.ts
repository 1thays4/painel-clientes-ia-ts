import { Request, Response } from "express";
import {
  verificarClientesParaFollowup,
  marcarClienteParaFollowup,
} from "../utils";
import axios from "axios";
import { config } from "../config";

/**
 * Endpoint para verificar e processar clientes que precisam de follow-up
 * Pode ser chamado manualmente ou por um cron job
 */
export async function processarFollowups(req: Request, res: Response) {
  try {
    // Verificar clientes que precisam de follow-up
    const {
      success,
      data: clientesParaFollowup,
      error,
    } = await verificarClientesParaFollowup();

    if (!success || error) {
      console.error("Erro ao verificar clientes para follow-up:", error);
      return res
        .status(500)
        .json({ error: "Erro ao verificar clientes para follow-up" });
    }

    if (!clientesParaFollowup || clientesParaFollowup.length === 0) {
      return res.status(200).json({
        message: "Nenhum cliente precisa de follow-up no momento",
        clientesProcessados: 0,
      });
    }

    console.log(
      `Encontrados ${clientesParaFollowup.length} clientes para follow-up`,
    );

    // Chamar o webhook do n8n para processar os follow-ups
    try {
      await axios.post(
        config.N8N_FOLLOWUP_WEBHOOK_URL ||
          "http://localhost:5678/webhook/followup",
        {
          clientesParaFollowup,
        },
      );

      console.log("Webhook do n8n chamado com sucesso");
    } catch (webhookError) {
      console.error("Erro ao chamar webhook do n8n:", webhookError);
      // Continuar mesmo com erro no webhook
    }

    // Atualizar o status dos clientes para follow-up
    const clientesAtualizados = [];

    for (const cliente of clientesParaFollowup) {
      const resultado = await marcarClienteParaFollowup(
        cliente.id,
        "em aberto",
        `Follow-up automático agendado: ${cliente.tipoFollowUp}`,
      );

      if (resultado.success) {
        clientesAtualizados.push(cliente.id);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Follow-ups processados com sucesso`,
      clientesProcessados: clientesParaFollowup.length,
      clientesAtualizados,
    });
  } catch (error) {
    console.error("Erro ao processar follow-ups:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}
