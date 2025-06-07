import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PainelClientesIA from './components/painel-clientes-ia';
import PainelCliente from './components/PainelCliente';
import Login from './components/Login';
import Registro from './components/Registro';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
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
          {/* Rota do cliente não precisa de proteção, pois tem sua própria lógica de autorização */}
          <Route path="/cliente/:token" element={<PainelCliente />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;