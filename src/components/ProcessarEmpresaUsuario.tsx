import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ToastContainer, toast } from 'react-toastify';
import { formatarWhatsAppParaExibicao, validarWhatsApp } from '../lib/validacao';
import 'react-toastify/dist/ReactToastify.css';

interface ProcessarEmpresaUsuarioProps {
  clienteId: string | number;
  onProcessado?: (dados: { empresa: any | null, usuario: any | null }) => void;
}

const ProcessarEmpresaUsuario: React.FC<ProcessarEmpresaUsuarioProps> = ({ 
  clienteId,
  onProcessado 
}) => {
  const [texto, setTexto] = useState('');
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<{
    empresa: any | null,
    usuario: any | null
  } | null>(null);

  const handleProcessar = async () => {
    if (!texto.trim()) {
      toast.error('Digite as informações da empresa e usuário');
      return;
    }

    setProcessando(true);
    try {
      // Extrair informações da empresa
      const empresaMatch = texto.match(/Empresa:?\s*([^0-9\n]+)(?:\s+)?([0-9+\-\s]+)?/i);
      const empresaNome = empresaMatch?.[1]?.trim() || 'Empresa';
      let empresaWhatsapp = empresaMatch?.[2]?.trim() || '';
      
      // Extrair informações do usuário final
      const usuarioMatch = texto.match(/Usuário final:?\s*([^0-9\n]+)?(?:\s+)?([0-9+\-\s]+)?/i);
      const usuarioNome = usuarioMatch?.[1]?.trim() || 'Usuário final';
      let usuarioWhatsapp = usuarioMatch?.[2]?.trim() || '';
      
      // Se não encontrou WhatsApp na linha da empresa, procurar em uma linha separada
      if (!empresaWhatsapp) {
        const whatsappMatch = texto.match(/WhatsApp:?\s*([0-9+\-\s]+)/i);
        empresaWhatsapp = whatsappMatch?.[1]?.trim() || '';
      }
      
      // Validar números de WhatsApp
      const empresaWhatsappFormatado = validarWhatsApp(empresaWhatsapp);
      const usuarioWhatsappFormatado = validarWhatsApp(usuarioWhatsapp);
      
      // Se não tiver WhatsApp da empresa, não pode prosseguir
      if (!empresaWhatsappFormatado) {
        toast.error('Número de WhatsApp da empresa inválido ou não fornecido');
        return;
      }
      
      const dados = {
        empresa: {
          nome: empresaNome,
          whatsapp: empresaWhatsappFormatado,
          cliente_id: clienteId
        },
        usuario: usuarioWhatsappFormatado ? {
          nome: usuarioNome,
          whatsapp: usuarioWhatsappFormatado,
          cliente_id: clienteId
        } : null
      };
      
      setResultado(dados);
      toast.success('Dados processados com sucesso!');
      
      if (onProcessado) {
        onProcessado(dados);
      }
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      toast.error('Ocorreu um erro ao processar os dados');
    } finally {
      setProcessando(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">Processar Empresa e Usuário</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Cole as informações da empresa e usuário
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Exemplo:
Empresa: Nome da Empresa +15557811105
WhatsApp: 15557811105

Usuário final: Nome do Usuário"
            className="w-full p-2 border rounded-md min-h-[120px]"
          />
        </div>
        
        <Button
          onClick={handleProcessar}
          disabled={processando}
          className="w-full"
        >
          {processando ? 'Processando...' : 'Processar Dados'}
        </Button>
        
        {resultado && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            
            {resultado.empresa && (
              <div className="mb-3">
                <p className="font-medium">Empresa:</p>
                <p>Nome: {resultado.empresa.nome}</p>
                <p>WhatsApp: {formatarWhatsAppParaExibicao(resultado.empresa.whatsapp)}</p>
              </div>
            )}
            
            {resultado.usuario && (
              <div>
                <p className="font-medium">Usuário Final:</p>
                <p>Nome: {resultado.usuario.nome}</p>
                <p>WhatsApp: {formatarWhatsAppParaExibicao(resultado.usuario.whatsapp)}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessarEmpresaUsuario;