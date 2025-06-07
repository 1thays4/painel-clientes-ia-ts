import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import PainelClientesIA from './components/painel-clientes-ia';
import PainelCliente from './components/PainelCliente';
import Login from './components/Login';
import Registro from './components/Registro';
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
      // Não redirecionar se estiver na página do cliente
      if (location.pathname.startsWith('/cliente/')) {
        return;
      }
      
      if (user && (location.pathname === '/login' || location.pathname === '/registro')) {
        // Se estiver autenticado e na página de login ou registro, redireciona para o painel
        navigate('/', { replace: true });
      } else if (!user && location.pathname !== '/login' && location.pathname !== '/registro') {
        // Se não estiver autenticado e não estiver na página de login ou registro, redireciona para login
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
        <Route path="/registro" element={<Registro />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <PainelClientesIA />
            </ProtectedRoute>
          } 
        />
        {/* Rota do cliente não precisa de proteção, pois tem sua própria lógica de autorização */}
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