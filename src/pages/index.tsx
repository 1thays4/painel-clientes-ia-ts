import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PainelClientesIA from "../components/painel-clientes-ia";
import { useAuth } from "../contexts/AuthContext";
import { CircularProgress, Box, Typography } from "@mui/material";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  // Mostrar tela de carregamento apenas por um tempo limitado
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Se ainda estiver carregando, mostrar indicador
  if (loading && showLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 4 }}>
          Carregando painel...
        </Typography>
      </Box>
    );
  }

  // Se não estiver autenticado e não estiver mais carregando, mostrar mensagem
  if (!user && !loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Você precisa estar autenticado para acessar esta página
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Redirecionando para a página de login...
        </Typography>
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Se estiver autenticado, mostrar o painel
  console.log("Página index.tsx - Estado de autenticação:", { user, loading });
  return user ? <PainelClientesIA /> : null;
}
