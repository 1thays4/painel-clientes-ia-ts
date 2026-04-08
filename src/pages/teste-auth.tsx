import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Box, Typography, Button, Paper } from "@mui/material";

export default function TesteAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao verificar sessão:", error);
          setError(error.message);
        } else if (data.session) {
          console.log("Sessão encontrada:", data.session);
          setUser(data.session.user);
        } else {
          console.log("Nenhuma sessão encontrada");
        }
      } catch (err: any) {
        console.error("Erro inesperado:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "thayscosta66@gmail.com",
        password: prompt("Digite a senha:") || "",
      });

      if (error) {
        console.error("Erro de login:", error);
        setError(error.message);
      } else if (data.user) {
        console.log("Login bem-sucedido:", data.user);
        setUser(data.user);

        // Forçar redirecionamento para a página inicial
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (err: any) {
      console.error("Erro inesperado:", err);
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log("Logout realizado com sucesso");
    } catch (err: any) {
      console.error("Erro ao fazer logout:", err);
      setError(err.message);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Teste de Autenticação
        </Typography>

        {loading ? (
          <Typography>Verificando autenticação...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : user ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Usuário autenticado
            </Typography>
            <Typography>Email: {user.email}</Typography>
            <Typography>ID: {user.id}</Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Fazer Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              Nenhum usuário autenticado
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              sx={{ mt: 2 }}
            >
              Fazer Login
            </Button>
          </Box>
        )}
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Links de Navegação
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => (window.location.href = "/")}
          >
            Página Inicial
          </Button>
          <Button
            variant="outlined"
            onClick={() => (window.location.href = "/login")}
          >
            Página de Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
