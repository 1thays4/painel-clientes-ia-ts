import React, { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'react-toastify';
import { atualizarModoBotClienteFinal } from '../services/cliente-final';

interface ModoBotToggleProps {
  clienteFinalId: string | number;
  modoBotAtivo: boolean;
  onToggle?: (novoEstado: boolean) => void;
  className?: string;
}

export default function ModoBotToggle({ 
  clienteFinalId, 
  modoBotAtivo = true, 
  onToggle,
  className = ''
}: ModoBotToggleProps) {
  const [ativo, setAtivo] = useState(modoBotAtivo);
  const [atualizando, setAtualizando] = useState(false);

  const toggleModoBot = async () => {
    if (!clienteFinalId) return;
    
    setAtualizando(true);
    try {
      const novoEstado = !ativo;
      
      // Atualizar no banco de dados usando o serviço
      const sucesso = await atualizarModoBotClienteFinal(clienteFinalId, novoEstado);
      
      if (!sucesso) {
        toast.error('Erro ao atualizar modo de resposta automática');
        return;
      }
      
      // Atualizar estado local
      setAtivo(novoEstado);
      
      // Notificar componente pai
      if (onToggle) {
        onToggle(novoEstado);
      }
      
      toast.success(`Modo de resposta automática ${novoEstado ? 'ativado' : 'desativado'}`);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Ocorreu um erro ao atualizar o modo de resposta');
    } finally {
      setAtualizando(false);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative inline-block w-12 h-6 mr-2">
        <input
          type="checkbox"
          className="opacity-0 w-0 h-0"
          checked={ativo}
          onChange={toggleModoBot}
          disabled={atualizando}
          id={`toggle-${clienteFinalId}`}
        />
        <label
          htmlFor={`toggle-${clienteFinalId}`}
          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 ${ativo ? 'bg-green-500' : 'bg-gray-300'}`}
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
        >
          <span 
            className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${ativo ? 'transform translate-x-6' : ''}`}
          />
        </label>
      </div>
      <span className="text-sm font-medium">
        {ativo ? (
          <span className="text-green-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
            </svg>
            <span className="hidden sm:inline">Bot Ativo</span>
          </span>
        ) : (
          <span className="text-gray-600 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 7v4" />
              <line x1="8" y1="16" x2="8" y2="16" />
              <line x1="16" y1="16" x2="16" y2="16" />
              <line x1="3" y1="3" x2="21" y2="21" />
            </svg>
            <span className="hidden sm:inline">Bot Desativado</span>
          </span>
        )}
      </span>
    </div>
  );
}