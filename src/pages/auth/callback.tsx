import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { CircularProgress, Box, Typography } from '@mui/material';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Processar o callback do magic link
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao processar callback de autenticação:', error);
          // Redirecionar para a página de login em caso de erro
          window.location.href = '/login';
          return;
        }
        
        console.log('Autenticação bem-sucedida via magic link');
        
        // Redirecionar para a página inicial após autenticação bem-sucedida
        window.location.href = '/';
      } catch (error) {
        console.error('Erro ao processar callback:', error);
        // Redirecionar para a página de login em caso de erro
        window.location.href = '/login';
      }
    };

    // Processar o callback quando a página carregar
    handleAuthCallback();
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: 3
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">Autenticando...</Typography>
    </Box>
  );
}