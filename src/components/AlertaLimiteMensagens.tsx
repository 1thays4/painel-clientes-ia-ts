import React from 'react';
import { verificarLimiteMensagens } from '../lib/validacao';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { Warning, Error as ErrorIcon } from '@mui/icons-material';

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
    <Alert 
      severity={limiteInfo.status === 'critico' ? 'error' : 'warning'}
      variant="outlined"
      icon={limiteInfo.status === 'critico' ? <ErrorIcon /> : <Warning />}
      sx={{ 
        borderRadius: 2,
        '& .MuiAlert-message': { width: '100%' }
      }}
    >
      <AlertTitle>
        {limiteInfo.status === 'critico' 
          ? 'Limite de mensagens atingido' 
          : 'Limite de mensagens próximo'
        }
      </AlertTitle>
      
      {limiteInfo.mensagem}
      <Box sx={{ mt: 1 }}>
        {limiteInfo.status === 'critico'
          ? 'Faça upgrade do seu plano para continuar enviando mensagens.'
          : 'Considere fazer upgrade do seu plano para evitar interrupções.'
        }
      </Box>
      
      {onUpgrade && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color={limiteInfo.status === 'critico' ? 'error' : 'warning'}
            onClick={onUpgrade}
          >
            Fazer Upgrade de Plano
          </Button>
        </Box>
      )}
    </Alert>
  );
};

export default AlertaLimiteMensagens;