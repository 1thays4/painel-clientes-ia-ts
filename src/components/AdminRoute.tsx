import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push(`/cliente/${user.id}`);
      }
    }
  }, [user, loading, isAdmin, router]);

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  // Não renderiza nada enquanto redireciona
  if (!user || !isAdmin) {
    return null;
  }

  // Renderiza o conteúdo protegido se for admin
  return <>{children}</>;
}