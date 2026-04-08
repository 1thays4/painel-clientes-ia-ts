import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

interface ClienteFinal {
  id: string | number;
  nome: string;
  whatsapp?: string;
  cliente_id: string; // UUID
  modo?: boolean;
}

interface ClienteFinalSelectorProps {
  onClienteFinalSelecionado: (clienteFinalId: string | number | null) => void;
  clienteFinalSelecionado: string | number | null;
  clienteId: string | number | null;
}

export default function ClienteFinalSelector({
  onClienteFinalSelecionado,
  clienteFinalSelecionado,
  clienteId,
}: ClienteFinalSelectorProps) {
  const [clientesFinais, setClientesFinais] = useState<ClienteFinal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    if (!clienteId) {
      setClientesFinais([]);
      setCarregando(false);
      return;
    }

    const buscarClientesFinais = async () => {
      try {
        setCarregando(true);

        // Se for um cliente de demonstração, retornar dados fictícios
        if (typeof clienteId === "string" && clienteId.startsWith("demo-")) {
          setClientesFinais([
            {
              id: 101,
              nome: "João Silva",
              whatsapp: "5511988888888",
              cliente_id: clienteId as string,
            },
            {
              id: 102,
              nome: "Maria Oliveira",
              whatsapp: "5511977777777",
              cliente_id: clienteId as string,
            },
            {
              id: 103,
              nome: "Carlos Pereira",
              whatsapp: "5511966666666",
              cliente_id: clienteId as string,
            },
          ]);
          return;
        }

        // Primeiro, buscar o número da empresa
        const { data: empresaData, error: empresaError } = await supabase
          .from("clientes")
          .select("whatsapp")
          .eq("id", clienteId)
          .single();

        if (empresaError) {
          console.error("Erro ao buscar dados da empresa:", empresaError);
        }

        const numeroEmpresa = empresaData?.whatsapp?.replace(/\D/g, "");

        // Buscar todos os clientes finais
        const { data, error } = await supabase
          .from("clientes_finais")
          .select("id, nome, whatsapp, cliente_id")
          .eq("cliente_id", clienteId)
          .order("nome");

        if (error) {
          console.error("Erro ao buscar clientes finais:", error);
          return;
        }

        // Filtrar clientes finais que têm o mesmo número da empresa
        const clientesFinaisFiltrados = data
          ? data.filter((cliente: { whatsapp: string }) => {
              const numeroCliente = cliente.whatsapp?.replace(/\D/g, "");
              return (
                !numeroEmpresa ||
                !numeroCliente ||
                numeroEmpresa !== numeroCliente
              );
            })
          : [];

        setClientesFinais(clientesFinaisFiltrados);
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarClientesFinais();
  }, [clienteId]);

  const clientesFiltrados = clientesFinais.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      (cliente.whatsapp && cliente.whatsapp.includes(filtro)),
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Filtrar por Contato
      </Typography>

      {!clienteId ? (
        <Typography variant="body2" color="text.secondary">
          Selecione uma empresa primeiro
        </Typography>
      ) : (
        <>
          <TextField
            fullWidth
            size="small"
            type="text"
            placeholder="Filtrar por nome"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Button
              variant={
                clienteFinalSelecionado === null ? "contained" : "outlined"
              }
              onClick={() => onClienteFinalSelecionado(null)}
              sx={{ mb: 1 }}
            >
              Todos os Contatos
            </Button>

            {carregando ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                  Carregando contatos...
                </Typography>
              </Box>
            ) : clientesFiltrados.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum contato encontrado
              </Typography>
            ) : (
              clientesFiltrados.map((cliente) => (
                <Button
                  key={cliente.id}
                  variant={
                    clienteFinalSelecionado === cliente.id
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => onClienteFinalSelecionado(cliente.id)}
                  sx={{ mb: 1 }}
                >
                  {cliente.nome} {cliente.whatsapp && `(${cliente.whatsapp})`}
                </Button>
              ))
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
