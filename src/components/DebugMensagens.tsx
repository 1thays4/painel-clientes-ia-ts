import React from 'react';
import { Mensagem } from '../services/cliente';
import { Box, Typography, Paper, useTheme } from '@mui/material';

interface DebugMensagensProps {
  mensagens: Mensagem[];
  clienteFinalSelecionado: string | number | null;
}

export default function DebugMensagens({ mensagens, clienteFinalSelecionado }: DebugMensagensProps) {
  const theme = useTheme();
  // Mostrar apenas as primeiras 5 mensagens para não sobrecarregar a UI
  const mensagensParaMostrar = mensagens.slice(0, 5);
  
  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: theme.palette.background.default }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Debug Info:</Typography>
      <Typography variant="body2">Cliente Final Selecionado: {clienteFinalSelecionado}</Typography>
      <Typography variant="body2">Total de mensagens: {mensagens.length}</Typography>
      <Typography variant="body2">Primeiras 5 mensagens:</Typography>
      
      {mensagensParaMostrar.map((msg, index) => (
        <Box key={index} sx={{ mt: 1, p: 1, bgcolor: theme.palette.divider, borderRadius: 1 }}>
          <Typography variant="caption" component="div">
            ID: {msg.id}, Cliente Final ID: {msg.cliente_final_id} (tipo: {typeof msg.cliente_final_id})
          </Typography>
          <Typography variant="caption" component="div">
            Nome Cliente Final: {msg.nome_cliente_final}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}