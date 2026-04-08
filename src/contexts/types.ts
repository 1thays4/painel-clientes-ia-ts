// Tipos para o contexto de autenticação
export type User = {
  id: string;
  email?: string;
  user_metadata?: {
    role?: "admin" | "user";
    name?: string;
  };
};

export type Session = any;

export type UserRole = "admin" | "user";
