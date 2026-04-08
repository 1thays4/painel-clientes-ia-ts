import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  "";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.REACT_APP_SUPABASE_KEY ||
  "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function verificarConexaoSupabase() {
  try {
    const { error } = await supabase
      .from("clientes")
      .select("count", { count: "exact", head: true });

    return !error;
  } catch {
    return false;
  }
}
