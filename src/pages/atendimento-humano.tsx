import React from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import DashboardHumano from "../components/DashboardHumano";
import { useAuth } from "../contexts/AuthContext";

export default function AtendimentoHumanoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return user ? <DashboardHumano /> : null;
}
