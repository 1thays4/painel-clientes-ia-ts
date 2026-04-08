import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "react-toastify";
import { criarCliente } from "../services/cliente";
import { validarWhatsApp } from "../lib/validacao";
import { config } from "../config";
import "react-toastify/dist/ReactToastify.css";

export default function AdicionarCliente({
  onClienteAdicionado,
}: {
  onClienteAdicionado: () => void;
}) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [plano, setPlano] = useState("essencial");
  const [carregando, setCarregando] = useState(false);
  const [whatsappError, setWhatsappError] = useState("");

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    setWhatsapp(valor);

    // Limpar erro quando o campo estiver vazio
    if (!valor) {
      setWhatsappError("");
      return;
    }

    // Validar o número
    const numeroValidado = validarWhatsApp(valor);
    if (!numeroValidado && valor.length > 0) {
      setWhatsappError("Número de WhatsApp inválido");
    } else {
      setWhatsappError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome) {
      toast.error("Nome é obrigatório");
      return;
    }

    // Validar WhatsApp se foi informado
    if (whatsapp) {
      const numeroValidado = validarWhatsApp(whatsapp);
      if (!numeroValidado) {
        setWhatsappError("Número de WhatsApp inválido");
        toast.error("Número de WhatsApp inválido");
        return;
      }
    }

    setCarregando(true);

    try {
      const novoCliente = await criarCliente({
        nome,
        plano,
        whatsapp: whatsapp ? validarWhatsApp(whatsapp) : "",
      });

      if (novoCliente) {
        toast.success("Cliente adicionado com sucesso!");
        setNome("");
        setWhatsapp("");
        setPlano("essencial");
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

  // Obter informações dos planos da configuração
  const planos = config.planos;

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
              onChange={handleWhatsappChange}
              placeholder="(00) 00000-0000"
              className={whatsappError ? "border-red-500" : ""}
            />
            {whatsappError && (
              <p className="text-red-500 text-sm mt-1">{whatsappError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Formato: código do país + DDD + número (ex: 5511999999999)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Plano</label>
            <select
              value={plano}
              onChange={(e) => setPlano(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="essencial">
                Básico - {planos.essencial.limite} mensagens - R${" "}
                {planos.essencial.preco}/mês
              </option>
              <option value="Profissional">
                Intermediário - {planos.Profissional.limite} mensagens - R${" "}
                {planos.Profissional.preco}/mês
              </option>
              <option value="Estratégico">
                Avançado - {planos.Estratégico.limite} mensagens - R${" "}
                {planos.Estratégico.preco}/mês
              </option>
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
