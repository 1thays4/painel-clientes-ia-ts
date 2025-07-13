import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import Link from 'next/link';

export default function Entrada() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Painel de Clientes IA
        </Typography>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          {user ? (
            <>
              <Typography variant="body1" gutterBottom>
                Você está logado como <strong>{user.email}</strong>
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Link href="/painel" passHref>
                  <Button variant="contained" color="primary" fullWidth>
                    Acessar Painel
                  </Button>
                </Link>
              </Box>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  fullWidth
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                >
                  Sair
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="body1" gutterBottom>
                Faça login para acessar o painel
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Link href="/login" passHref>
                  <Button variant="contained" color="primary" fullWidth>
                    Login
                  </Button>
                </Link>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
}