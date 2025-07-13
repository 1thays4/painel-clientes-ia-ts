import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginSimples() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Por favor, preencha todos os campos");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Tentando login simples com:', email);
      
      // Login direto com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('Resposta do login simples:', { data, error });
      
      if (error) {
        console.error('Erro de login:', error);
        alert("Falha no login: " + (error.message || 'Credenciais inválidas'));
      } else if (data && data.user) {
        console.log('Login bem-sucedido:', data.user);
        alert("Login realizado com sucesso!");
        
        // Forçar redirecionamento imediato
        window.location.replace('/');
      } else {
        console.error('Login sem erro, mas sem usuário retornado');
        alert("Erro desconhecido no login");
      }
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      alert("Ocorreu um erro durante o login");
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
      <h1>Login Simples</h1>
      
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
            cursor: 'pointer'
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