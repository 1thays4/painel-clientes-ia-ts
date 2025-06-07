// Declarações de tipo para o Supabase
declare module '@supabase/supabase-js/dist/module' {
  export function createClient(supabaseUrl: string, supabaseKey: string): any;
}