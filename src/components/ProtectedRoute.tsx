import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  // Não renderiza nada enquanto redireciona
  if (!user) {
    return null;
  }

  // Renderiza o conteúdo protegido se estiver autenticado
  return <>{children}</>;
}