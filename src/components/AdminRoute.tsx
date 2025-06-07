import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  // Redireciona para a página de login se não estiver autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redireciona para o painel do cliente se não for admin
  if (!isAdmin) {
    return <Navigate to={`/cliente/${user.id}`} replace />;
  }

  // Renderiza o conteúdo protegido se for admin
  return <>{children}</>;
}