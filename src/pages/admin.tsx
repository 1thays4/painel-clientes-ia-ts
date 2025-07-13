import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function AdminRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Usuário autenticado, redirecionar para o painel de administração
      console.log('Redirecionando para o painel de administração...');
      router.push('/');
    } else if (!loading && !user) {
      // Usuário não autenticado, redirecionar para login
      console.log('Usuário não autenticado, redirecionando para login...');
      router.push('/login');
    }
  }, [user, loading, router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 4 }}>
        Redirecionando para o painel principal...
      </Typography>
    </Box>
  );
}