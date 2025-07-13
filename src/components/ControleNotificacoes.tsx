import React, { useState, useEffect } from 'react';
import { notificacaoService } from '../services/notificacoes';
import { 
  Button, 
  Box, 
  Typography 
} from '@mui/material';

interface ControleNotificacoesProps {
  className?: string;
}

export default function ControleNotificacoes({ className = '' }: ControleNotificacoesProps) {
  const [notificacoesAtivadas, setNotificacoesAtivadas] = useState(
    notificacaoService.isNotificacoesAtivadas()
  );

  // Alternar notificações
  const toggleNotificacoes = () => {
    const novoEstado = notificacaoService.toggleNotificacoes();
    setNotificacoesAtivadas(novoEstado);
    
    // Se ativou, tocar um som de teste
    if (novoEstado) {
      setTimeout(() => {
        notificacaoService.tocarNotificacao();
      }, 300);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        variant={notificacoesAtivadas ? "contained" : "outlined"}
        size="small"
        onClick={toggleNotificacoes}
        title={notificacoesAtivadas ? "Desativar notificações sonoras" : "Ativar notificações sonoras"}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5,
          px: 1,
          py: 0.5,
          minWidth: 'auto'
        }}
      >
        {notificacoesAtivadas ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Som ativado</Box>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              <path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path>
              <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path>
              <path d="M18 8a6 6 0 0 0-9.33-5"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Som desativado</Box>
          </>
        )}
      </Button>
    </Box>
  );
}