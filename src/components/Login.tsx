import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "magic">("password");
  const { signIn, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error("Falha no login: " + error.message);
      } else {
        // Login bem-sucedido, redirecionar para o painel
        navigate("/");
      }
    } catch (error) {
      toast.error("Ocorreu um erro durante o login");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, informe seu e-mail");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await signInWithMagicLink(email);
      
      if (error) {
        toast.error("Falha ao enviar link mágico: " + error.message);
      } else {
        setMagicLinkSent(true);
        toast.success("Link de acesso enviado para seu e-mail!");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao enviar o link de acesso");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-center mb-6">Login do Cliente</h1>
          
          {/* Opções de login */}
          <div className="flex mb-6 border-b">
            <button
              className={`flex-1 py-2 text-center ${loginMethod === "password" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              onClick={() => setLoginMethod("password")}
            >
              E-mail e Senha
            </button>
            <button
              className={`flex-1 py-2 text-center ${loginMethod === "magic" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
              onClick={() => setLoginMethod("magic")}
            >
              Link Mágico
            </button>
          </div>
          
          {loginMethod === "password" ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          ) : (
            <div>
              {magicLinkSent ? (
                <div className="text-center py-4">
                  <p className="mb-4">✅ Link de acesso enviado para:</p>
                  <p className="font-bold mb-4">{email}</p>
                  <p className="text-sm text-gray-600 mb-4">Verifique sua caixa de entrada e clique no link enviado para acessar sua conta.</p>
                  <Button 
                    className="mt-2"
                    onClick={() => setMagicLinkSent(false)}
                  >
                    Enviar novamente
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLinkLogin} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar link de acesso"}
                  </Button>
                  <p className="text-sm text-center text-gray-600">
                    Enviaremos um link para seu e-mail que permitirá acesso imediato à sua conta.
                  </p>
                </form>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}