import React from "react";
import { useRouter } from "next/router";
import ClienteLogin from "../../components/ClienteLogin";

export default function ClienteLoginPage() {
  const router = useRouter();
  const { token } = router.query;

  if (!token || typeof token !== "string") {
    return <div>Carregando...</div>;
  }

  return <ClienteLogin />;
}
