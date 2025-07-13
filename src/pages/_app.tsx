import React, { useEffect } from 'react';
import { AppProps } from 'next/app';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from '../contexts/AuthContext';
import { notificacaoService } from '../services/notificacoes';
import '../styles/globals.css';
import '../styles/message-styles.css';
import '../styles/notification.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Criando um tema personalizado do Material UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  console.log('Renderizando _app.tsx');
  // Inicializar o serviço de notificações
  useEffect(() => {
    // Garantir que o serviço de notificações está disponível
    if (typeof window !== 'undefined') {
      notificacaoService.isNotificacoesAtivadas();
      
      // Verificar se o script de notificação está carregado
      if (!(window as any).generateNotificationSound) {
        console.log('Inicializando gerador de notificações');
        // Tentar carregar o script se não estiver disponível
        const script = document.createElement('script');
        script.src = '/notification.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normaliza os estilos CSS */}
      <AuthProvider>
        <Component {...pageProps} />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;