import { createClient } from "@supabase/supabase-js";

// Usando as mesmas credenciais do Supabase
const supabaseUrl = "https://sqcedymaeazvrrgrokpv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxY2VkeW1hZWF6dnJyZ3Jva3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5OTc3NTUsImV4cCI6MjA2NDU3Mzc1NX0.D65rBFBiVE1F9mVI15QgJeDepEhQtPj3eS2kXxRCfB8";
const supabase = createClient(supabaseUrl, supabaseKey);

// Registrar uma nova mensagem de IA no WhatsApp
export async function registrarMensagem(clienteId: number) {
  const { error } = await supabase.from('mensagens_enviadas').insert({
    cliente_id: clienteId,
    timestamp: new Date().toISOString(),
    conteudo: "Uso de IA no WhatsApp"
  });
  
  if (error) {
    console.error("Erro ao registrar uso de IA:", error);
    throw new Error("Falha ao registrar uso de IA no WhatsApp");
  }
}

// Contar mensagens do mês atual
export async function contarMensagensMes(clienteId: number) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data, error, count } = await supabase
    .from('mensagens_enviadas')
    .select('id', { count: 'exact' })
    .eq('cliente_id', clienteId)
    .gte('timestamp', firstDay)
    .lte('timestamp', lastDay);

  if (error) {
    console.error("Erro ao contar mensagens:", error);
    return 0;
  }

  return count || 0;
}

// Verificar se o cliente atingiu o limite de mensagens
export async function verificarLimite(clienteId: number, limite: number) {
  const mensagensUsadas = await contarMensagensMes(clienteId);
  
  if (mensagensUsadas >= limite) {
    throw new Error("Limite de mensagens atingido neste mês.");
  }
  
  return {
    mensagensUsadas,
    limite,
    disponivel: limite - mensagensUsadas
  };
}