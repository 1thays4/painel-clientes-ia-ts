import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { notificacaoService } from './services/notificacoes';
import theme from './theme';

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