// Declarações de tipo para o Supabase
declare module '@supabase/supabase-js' {
  export function createClient(supabaseUrl: string, supabaseKey: string): any;
  export type Session = any;
  export type User = any;
}