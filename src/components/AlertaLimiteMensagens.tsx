import React from 'react';
import { verificarLimiteMensagens } from '../lib/validacao';
import { Button } from './ui/button';

interface AlertaLimiteMensagensProps {
  mensagensUsadas: number;
  mensagensLimite: number;
  onUpgrade?: () => void;
}

const AlertaLimiteMensagens: React.FC<AlertaLimiteMensagensProps> = ({
  mensagensUsadas,
  mensagensLimite,
  onUpgrade
}) => {
  const limiteInfo = verificarLimiteMensagens(mensagensUsadas, mensagensLimite);
  
  // Se não houver alerta, não renderizar nada
  if (limiteInfo.status === 'ok') {
    return null;
  }
  
  return (
    <div className={`p-4 mb-4 rounded-lg ${
      limiteInfo.status === 'critico' 
        ? 'bg-red-100 border border-red-200' 
        : 'bg-yellow-100 border border-yellow-200'
    }`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 w-5 h-5 mr-3 ${
          limiteInfo.status === 'critico' ? 'text-red-600' : 'text-yellow-600'
        }`}>
          {limiteInfo.status === 'critico' ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.485 10.857L10 9.343l1.515 1.514a.75.75 0 101.06-1.06L11.06 8.282l1.515-1.515a.75.75 0 00-1.06-1.06L10 7.222 8.485 5.707a.75.75 0 00-1.06 1.06L8.939 8.283 7.425 9.797a.75.75 0 001.06 1.06z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-medium ${
            limiteInfo.status === 'critico' ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {limiteInfo.status === 'critico' 
              ? 'Limite de mensagens atingido' 
              : 'Limite de mensagens próximo'
            }
          </h3>
          <div className={`mt-2 text-sm ${
            limiteInfo.status === 'critico' ? 'text-red-700' : 'text-yellow-700'
          }`}>
            <p>{limiteInfo.mensagem}</p>
            <p className="mt-1">
              {limiteInfo.status === 'critico'
                ? 'Faça upgrade do seu plano para continuar enviando mensagens.'
                : 'Considere fazer upgrade do seu plano para evitar interrupções.'
              }
            </p>
          </div>
          {onUpgrade && (
            <div className="mt-4">
              <Button
                onClick={onUpgrade}
                className={limiteInfo.status === 'critico' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }
              >
                Fazer Upgrade de Plano
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertaLimiteMensagens;