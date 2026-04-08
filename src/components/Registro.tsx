import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";
import { criarCliente } from "../services/cliente";
import "react-toastify/dist/ReactToastify.css";

export default function Registro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !email || !password) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      // 1. Criar o usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            whatsapp,
          },
        },
      });

      if (authError) {
        toast.error("Erro ao criar conta: " + authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        toast.error("Erro ao criar conta: usuário não retornado");
        setLoading(false);
        return;
      }

      // 2. Criar o cliente associado ao usuário
      const cliente = await criarCliente({
        nome,
        whatsapp,
      });

      if (!cliente) {
        toast.error("Conta criada, mas houve um erro ao configurar seu perfil");
        setLoading(false);
        return;
      }

      // 3. Sucesso!
      toast.success(
        "Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.",
      );

      // 4. Redirecionar para login após um breve delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Erro no registro:", error);
      toast.error("Ocorreu um erro durante o registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold text-center mb-6">Criar Conta</h1>
          <form onSubmit={handleRegistro} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome*</label>
              <Input
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email*</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha*</label>
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                WhatsApp (opcional)
              </label>
              <Input
                type="tel"
                placeholder="(00) 00000-0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
            <p className="text-center text-sm">
              Já tem uma conta?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/login");
                }}
              >
                Faça login
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
