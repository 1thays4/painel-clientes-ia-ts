import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  useTheme,
} from "@mui/material";

export default function FixSession() {
  const theme = useTheme();
  const [status, setStatus] = useState("Verificando sessão...");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAndFixSession = async () => {
      try {
        // Verificar sessão atual
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          setError(`Erro ao verificar sessão: ${sessionError.message}`);
          return;
        }

        if (sessionData.session) {
          setStatus("Sessão encontrada!");
          setUser(sessionData.session.user);

          // Tentar redirecionar para a página inicial
          setTimeout(() => {
            setStatus("Redirecionando para a página inicial...");
            window.location.href = "/";
          }, 2000);
        } else {
          setStatus("Nenhuma sessão encontrada. Tentando recuperar...");

          // Tentar recuperar sessão do localStorage
          const storedSession = localStorage.getItem("supabase.auth.token");

          if (storedSession) {
            try {
              const parsedSession = JSON.parse(storedSession);
              setStatus(
                "Sessão encontrada no localStorage. Tentando restaurar...",
              );

              // Tentar definir a sessão manualmente
              const { data, error } = await supabase.auth.setSession({
                access_token: parsedSession.access_token,
                refresh_token: parsedSession.refresh_token,
              });

              if (error) {
                setError(`Erro ao restaurar sessão: ${error.message}`);
              } else if (data.user) {
                setStatus("Sessão restaurada com sucesso!");
                setUser(data.user);

                // Tentar redirecionar para a página inicial
                setTimeout(() => {
                  setStatus("Redirecionando para a página inicial...");
                  window.location.href = "/";
                }, 2000);
              }
            } catch (e) {
              setError(`Erro ao processar sessão armazenada: ${e}`);
            }
          } else {
            setStatus("Nenhuma sessão encontrada no localStorage.");
          }
        }
      } catch (e) {
        setError(`Erro inesperado: ${e}`);
      }
    };

    checkAndFixSession();
  }, []);

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Verificação de Sessão
        </Typography>

        <Paper sx={{ p: 3, width: "100%", maxWidth: 600, textAlign: "center" }}>
          <Typography variant="body1" paragraph>
            <strong>Status:</strong> {status}
          </Typography>

          {error && (
            <Typography variant="body1" color="error" paragraph>
              <strong>Erro:</strong> {error}
            </Typography>
          )}

          {user && (
            <Box sx={{ mt: 3, textAlign: "left" }}>
              <Typography variant="h6" gutterBottom>
                Informações do Usuário:
              </Typography>
              <Box
                sx={{
                  bgcolor: theme.palette.background.default,
                  p: 2,
                  borderRadius: 1,
                  overflow: "auto",
                  maxWidth: "100%",
                }}
              >
                <pre style={{ margin: 0 }}>{JSON.stringify(user, null, 2)}</pre>
              </Box>
            </Box>
          )}

          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Button variant="contained" color="primary" href="/login">
              Ir para Login
            </Button>

            <Button variant="contained" color="success" href="/login-simples">
              Login Simples
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
