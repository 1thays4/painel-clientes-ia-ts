import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ToastContainer, toast } from "react-toastify";
import { criarCliente } from "../services/cliente";
import "react-toastify/dist/ReactToastify.css";

export default function AdicionarCliente({ onClienteAdicionado }: { onClienteAdicionado: () => void }) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [plano, setPlano] = useState("basico");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome) {
      toast.error("Nome é obrigatório");
      return;
    }
    
    setCarregando(true);
    
    try {
      const novoCliente = await criarCliente({
        nome,
        plano,
        whatsapp
      });
      
      if (novoCliente) {
        toast.success("Cliente adicionado com sucesso!");
        setNome("");
        setWhatsapp("");
        setPlano("basico");
        onClienteAdicionado();
      } else {
        toast.error("Erro ao adicionar cliente");
      }
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast.error("Ocorreu um erro ao adicionar o cliente");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">Adicionar Novo Cliente</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome*</label>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do cliente"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <Input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Plano</label>
            <select
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="basico">Básico</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={carregando}
          >
            {carregando ? "Adicionando..." : "Adicionar Cliente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}