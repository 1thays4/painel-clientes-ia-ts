import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function FixSession() {
  const [status, setStatus] = useState("Verificando sessão...");
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAndFixSession = async () => {
      try {
        // Verificar sessão atual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(`Erro ao verificar sessão: ${sessionError.message}`);
          return;
        }
        
        if (sessionData.session) {
          setStatus("Sessão encontrada!");
          setUser(sessionData.session.user);
          
          // Tentar redirecionar para a página inicial
          setTimeout(() => {
            setStatus("Redirecionando para a página inicial...");
            window.location.href = "/";
          }, 2000);
        } else {
          setStatus("Nenhuma sessão encontrada. Tentando recuperar...");
          
          // Tentar recuperar sessão do localStorage
          const storedSession = localStorage.getItem('supabase.auth.token');
          
          if (storedSession) {
            try {
              const parsedSession = JSON.parse(storedSession);
              setStatus("Sessão encontrada no localStorage. Tentando restaurar...");
              
              // Tentar definir a sessão manualmente
              const { data, error } = await supabase.auth.setSession({
                access_token: parsedSession.access_token,
                refresh_token: parsedSession.refresh_token
              });
              
              if (error) {
                setError(`Erro ao restaurar sessão: ${error.message}`);
              } else if (data.user) {
                setStatus("Sessão restaurada com sucesso!");
                setUser(data.user);
                
                // Tentar redirecionar para a página inicial
                setTimeout(() => {
                  setStatus("Redirecionando para a página inicial...");
                  window.location.href = "/";
                }, 2000);
              }
            } catch (e) {
              setError(`Erro ao processar sessão armazenada: ${e}`);
            }
          } else {
            setStatus("Nenhuma sessão encontrada no localStorage.");
          }
        }
      } catch (e) {
        setError(`Erro inesperado: ${e}`);
      }
    };
    
    checkAndFixSession();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1>Verificação de Sessão</h1>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p><strong>Status:</strong> {status}</p>
        
        {error && (
          <p style={{ color: 'red' }}><strong>Erro:</strong> {error}</p>
        )}
        
        {user && (
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <h2>Informações do Usuário:</h2>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxWidth: '100%'
            }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        )}
        
        <div style={{ marginTop: '30px' }}>
          <a href="/login" style={{ 
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}>
            Ir para Login
          </a>
          
          <a href="/login-simples" style={{ 
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}>
            Login Simples
          </a>
        </div>
      </div>
    </div>
  );
}