import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PainelClientesIA from './components/painel-clientes-ia';
import PainelClientePublico from './components/painel-cliente-publico';
import PainelCliente from './components/PainelCliente';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Componente para gerenciar redirecionamentos baseados em autenticação
const AuthRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user && location.pathname === '/login') {
        // Se estiver autenticado e na página de login, redireciona para o painel
        navigate('/', { replace: true });
      } else if (!user && location.pathname !== '/login' && !location.pathname.startsWith('/cliente/')) {
        // Se não estiver autenticado e não estiver na página de login ou painel do cliente, redireciona para login
        navigate('/login', { replace: true });
      }
    }
  }, [user, loading, navigate, location]);

  return null;
};

const AppRoutes = () => {
  return (
    <>
      <AuthRedirect />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <PainelClientesIA />
            </ProtectedRoute>
          } 
        />
        <Route path="/cliente/:token" element={<PainelCliente />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;