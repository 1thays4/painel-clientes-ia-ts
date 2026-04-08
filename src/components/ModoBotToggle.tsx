import React, { useState } from "react";
import { toast } from "react-toastify";
import { atualizarModoBotClienteFinal } from "../services/cliente-final";
import { Box, Typography, Switch, FormControlLabel } from "@mui/material";

interface ModoBotToggleProps {
  clienteFinalId: string | number;
  modoBotAtivo: boolean;
  onToggle?: (novoEstado: boolean) => void;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export default function ModoBotToggle({
  clienteFinalId,
  modoBotAtivo, // Sem valor padrão, usar o valor exato do banco de dados
  onToggle,
  className = "",
  onClick,
}: ModoBotToggleProps) {
  // Inicializar com o valor da prop, sem valor padrão
  const [ativo, setAtivo] = useState(modoBotAtivo);
  const [atualizando, setAtualizando] = useState(false);

  // Atualizar o estado local quando a prop mudar
  React.useEffect(() => {
    setAtivo(modoBotAtivo);
  }, [modoBotAtivo]);

  const toggleModoBot = async () => {
    if (!clienteFinalId) return;

    setAtualizando(true);
    try {
      const novoEstado = !ativo;

      // Atualizar no banco de dados usando o serviço
      const sucesso = await atualizarModoBotClienteFinal(
        clienteFinalId,
        novoEstado,
      );

      if (!sucesso) {
        toast.error("Erro ao atualizar modo de resposta automática");
        return;
      }

      // Atualizar estado local
      setAtivo(novoEstado);

      // Notificar componente pai
      if (onToggle) {
        onToggle(novoEstado);
      }

      toast.success(
        `Modo de resposta automática ${novoEstado ? "ativado" : "desativado"}`,
      );
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Ocorreu um erro ao atualizar o modo de resposta");
    } finally {
      setAtualizando(false);
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }} onClick={onClick}>
      <Switch
        checked={ativo}
        onChange={toggleModoBot}
        disabled={atualizando}
        color="success"
        size="small"
      />
      <Typography
        variant="body2"
        sx={{
          ml: 1,
          color: ativo ? "success.main" : "text.secondary",
          display: "flex",
          alignItems: "center",
          gap: 0.5,
        }}
      >
        {ativo ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
            </svg>
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Bot Ativo
            </Box>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
              <line x1="3" y1="3" x2="21" y2="21" />
            </svg>
            <Box
              component="span"
              sx={{ display: { xs: "none", sm: "inline" } }}
            >
              Bot Desativado
            </Box>
          </>
        )}
      </Typography>
    </Box>
  );
}
