import { useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Box, Typography } from "@mui/material";
import ProtectedRoute from "../components/ProtectedRoute";

export default function PainelRedirect() {
  console.log("Renderizando Painel");
  const router = useRouter();

  useEffect(() => {
    // Limpar qualquer estado de redirecionamento anterior
    sessionStorage.removeItem("lastRedirect");

    // Redirecionar para a página inicial após um pequeno delay
    const timer = setTimeout(() => {
      router.push("/");
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}

/* import React from 'react';

export default function Painel() {
  try {
    console.log("Renderizando Painel");
    return (
      <div>
        <h1>Painel Administrativo</h1>
        <p>Bem-vindo ao painel!</p>
      </div>
    );
  } catch (e) {
    console.error("Erro ao renderizar Painel:", e);
    return <div>Erro ao renderizar painel</div>;
  }
} */
