import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

type User = any;
type Session = any;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Verificar sessão atual
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Erro ao obter sessão:", error);
          setLoading(false);
          setInitialized(true);
          return;
        }

        setSession(session);

        if (session?.user) {
          console.log("Usuário autenticado:", session.user);
          setUser(session.user);
          const isAdminUser = session.user.email?.endsWith("@gmail.com");
          setIsAdmin(!!isAdminUser);
        } else {
          console.log("Nenhum usuário autenticado");
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    getSession();

    // Configurar listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: string, session: { user: { email: string } }) => {
        console.log("Auth state changed:", event, session?.user?.email);

        setSession(session);

        if (session?.user) {
          setUser(session.user);
          // Exemplo: admin se email termina com @seudominio.com
          const isAdminUser = session.user.email?.endsWith("@gmail.com");
          setIsAdmin(!!isAdminUser);
        } else {
          setUser(null);
          setIsAdmin(false);

          // Redirecionar para login se não estiver autenticado
          if (event === "SIGNED_OUT" && router.pathname !== "/login") {
            console.log("Redirecionando para login após logout");
            router.push("/login");
          }
        }

        setLoading(false);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router.pathname]);

  // Efeito para redirecionar com base no estado de autenticação
  useEffect(() => {
    if (!initialized || loading) return;

    const publicPages = [
      "/login",
      "/auth/callback",
      "/login-alternativo",
      "/login-simples",
      "/login-direto",
      "/login-basico",
      "/teste-auth",
    ];
    const isPublicPage = publicPages.includes(router.pathname);

    if (!user && !isPublicPage) {
      if (router.pathname !== "/login") router.replace("/login");
      return;
    }

    if (user && isPublicPage && router.pathname !== "/auth/callback") {
      const isAdminUser = user.email?.endsWith("@gmail.com");
      const destino = isAdminUser ? "/painel" : "/";
      console.log("Redirecionando:", {
        email: user.email,
        isAdminUser,
        destino,
        pathname: router.pathname,
      });
      if (router.pathname !== destino) {
        router.replace(destino);
      }
    }
  }, [user, loading, initialized, router.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Tentando login com:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        console.log("Login bem-sucedido:", data.user.email);
        setUser(data.user);
        setSession(data.session);
        const isAdminUser = data.user.email?.endsWith("@gmail.com");
        setIsAdmin(!!isAdminUser);
      } else {
        console.error("Erro no login:", error);
      }

      return { error };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { error };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      let redirectTo = "";
      if (typeof window !== "undefined") {
        redirectTo = `${window.location.origin}/auth/callback`;
      }

      console.log("Enviando link mágico para:", email);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        console.error("Erro ao enviar link mágico:", error);
      } else {
        console.log("Link mágico enviado com sucesso");
      }

      return { error };
    } catch (error) {
      console.error("Erro ao enviar link mágico:", error);
      return { error: error as any };
    }
  };

  const signOut = async () => {
    try {
      console.log("Fazendo logout");
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signInWithMagicLink,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
