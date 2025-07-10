import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import PainelClientesIA from './components/painel-clientes-ia';
import PainelCliente from './components/PainelCliente';
import ClienteLogin from './components/ClienteLogin';
import DashboardHumano from './components/DashboardHumano';
import Login from './components/Login';
import Registro from './components/Registro';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Dashboard from './components/Dashboard';
import DiagnosticoPage from './pages/DiagnosticoPage';
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

const App: React.FC = () => {
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
        <Router>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <PainelClientesIA />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div className="p-6 max-w-6xl mx-auto">
                  <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                  <Dashboard isAdmin={true} />
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/atendimento-humano" 
            element={
              <ProtectedRoute>
                <DashboardHumano />
              </ProtectedRoute>
            } 
          />
          {/* Rotas do cliente */}
          <Route path="/cliente-login/:token" element={<ClienteLogin />} />
          <Route path="/cliente/:token" element={<PainelCliente />} />
          <Route 
            path="/diagnostico" 
            element={
              <ProtectedRoute>
                <DiagnosticoPage />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;