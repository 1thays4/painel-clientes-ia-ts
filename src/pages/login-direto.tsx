import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function LoginDireto() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage("Por favor, preencha todos os campos");
      return;
    }
    
    setLoading(true);
    setMessage("Tentando login...");
    
    try {
      console.log('Tentando login direto com:', email);
      
      // Login direto com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Resposta do login direto:', { data, error });
      
      if (error) {
        console.error('Erro de login:', error);
        setMessage("Falha no login: " + (error.message || 'Credenciais inválidas'));
      } else if (data && data.user) {
        console.log('Login bem-sucedido:', data.user);
        setMessage("Login realizado com sucesso! Redirecionando...");
        
        // Marcar como autenticado no sessionStorage para evitar loops
        sessionStorage.setItem('autenticado', 'true');
        sessionStorage.setItem('lastRedirect', '/');
        
        // Redirecionar para a página inicial com o painel-clientes-ia
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        console.error('Login sem erro, mas sem usuário retornado');
        setMessage("Erro desconhecido no login");
      }
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      setMessage("Ocorreu um erro durante o login: " + (error?.message || "Erro desconhecido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <h1>Login Direto</h1>
      
      {message && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '10px', 
          backgroundColor: message.includes('sucesso') ? '#d4edda' : '#f8d7da',
          color: message.includes('sucesso') ? '#155724' : '#721c24',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ color: '#1976d2' }}>
          Voltar para o login normal
        </a>
      </div>
    </div>
  );
}