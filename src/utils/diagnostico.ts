import { supabase } from "../services/supabase";

// Função para verificar se uma tabela existe e se temos permissão para acessá-la
export async function verificarTabela(nomeTabela: string): Promise<void> {
  console.log(`\n--- Diagnóstico para tabela: ${nomeTabela} ---`);

  try {
    // Tentar fazer uma contagem de registros (menos dados para transferir)
    const { count, error } = await supabase
      .from(nomeTabela)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error(`Erro ao acessar tabela ${nomeTabela}:`, error);
      console.log(`Código: ${error.code}`);
      console.log(`Mensagem: ${error.message}`);
      console.log(`Detalhes: ${error.details}`);

      if (error.code === "42P01") {
        console.log(
          `DIAGNÓSTICO: A tabela "${nomeTabela}" não existe no banco de dados.`,
        );
      } else if (error.code?.startsWith("PGRST")) {
        console.log(
          `DIAGNÓSTICO: Problema de permissão do PostgREST. Verifique as políticas de segurança.`,
        );
      } else {
        console.log(
          `DIAGNÓSTICO: Erro desconhecido. Verifique o token de API e permissões.`,
        );
      }
    } else {
      console.log(`✅ Tabela "${nomeTabela}" existe e é acessível.`);
      console.log(`Total de registros: ${count}`);
    }
  } catch (error) {
    console.error(`Erro ao executar diagnóstico para ${nomeTabela}:`, error);
  }
}

// Função para verificar o token de API
export async function verificarToken(): Promise<void> {
  console.log("\n--- Diagnóstico do Token de API ---");

  try {
    // Tentar obter o usuário atual (se autenticado)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Erro ao verificar token:", error);
      console.log("DIAGNÓSTICO: Token de API inválido ou expirado.");
    } else if (user) {
      console.log("✅ Token de API válido.");
      console.log(`Usuário: ${user.email}`);
      console.log(`ID: ${user.id}`);
    } else {
      console.log("⚠️ Usando API anônima (sem autenticação).");
      console.log(
        "Algumas tabelas podem não estar acessíveis sem autenticação.",
      );
    }
  } catch (error) {
    console.error("Erro ao verificar token:", error);
  }
}

// Função principal de diagnóstico
export async function executarDiagnostico(): Promise<void> {
  console.log("=== INICIANDO DIAGNÓSTICO DO BANCO DE DADOS ===");

  // Verificar token
  await verificarToken();

  // Verificar tabelas
  await verificarTabela("clientes");
  await verificarTabela("clientes_finais");
  await verificarTabela("cliente_final");
  await verificarTabela("mensagens_enviadas");

  console.log("\n=== DIAGNÓSTICO CONCLUÍDO ===");
}
