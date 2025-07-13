import React, { useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { notificacaoService } from './services/notificacoes';

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

const App: React.FC<{ Component: React.ComponentType<any>, pageProps: any }> = ({ Component, pageProps }) => {
  // Inicializar o serviço de notificações
  useEffect(() => {
    // Garantir que o serviço de notificações está disponível
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
  }, []);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normaliza os estilos CSS */}
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;