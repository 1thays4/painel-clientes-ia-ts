import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function HomeSimples() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erro ao verificar sessão:", error);
          return;
        }
        
        if (data.session) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('autenticado');
      sessionStorage.removeItem('lastRedirect');
      window.location.href = '/login';
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <h1>Carregando...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <h1>Você não está autenticado</h1>
        <p>Por favor, faça login para acessar esta página.</p>
        <div style={{ marginTop: '20px' }}>
          <a 
          href="/login"
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Ir para Login
        </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1>Página Inicial Simples</h1>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>Bem-vindo!</strong></p>
        <p>Você está autenticado como: {user.email}</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sair
        </button>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <a href="/" style={{ color: '#1976d2' }}>
          Ir para a página inicial normal
        </a>
      </div>
    </div>
  );
}