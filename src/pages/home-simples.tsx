import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Link as MuiLink,
  useTheme,
} from "@mui/material";

export default function HomeSimples() {
  const theme = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao verificar sessão:", error);
          return;
        }

        if (data.session) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem("autenticado");
      sessionStorage.removeItem("lastRedirect");
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="h5" sx={{ mt: 2 }}>
          Carregando...
        </Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p: 3,
          }}
        >
          <Paper
            sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: 2 }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Você não está autenticado
            </Typography>
            <Typography variant="body1" paragraph>
              Por favor, faça login para acessar esta página.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              href="/login"
              sx={{ mt: 2 }}
            >
              Ir para Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          p: 3,
        }}
      >
        <Paper
          sx={{ p: 4, width: "100%", textAlign: "center", borderRadius: 2 }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Página Inicial Simples
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bem-vindo!
            </Typography>
            <Typography variant="body1">
              Você está autenticado como: {user.email}
            </Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Button variant="contained" color="error" onClick={handleLogout}>
              Sair
            </Button>
          </Box>

          <Box sx={{ mt: 3 }}>
            <MuiLink href="/" underline="hover">
              Ir para a página inicial normal
            </MuiLink>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
