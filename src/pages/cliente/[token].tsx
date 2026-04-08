import React from "react";
import { useRouter } from "next/router";
import PainelCliente from "../../components/PainelCliente";

export default function ClientePage() {
  const router = useRouter();
  const { token } = router.query;

  if (!token || typeof token !== "string") {
    return <div>Carregando...</div>;
  }

  return <PainelCliente token={token} />;
}
