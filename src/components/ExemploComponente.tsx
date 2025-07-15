import React from 'react';
import { Box, Button, Card, Typography, useTheme } from '@mui/material';

// Exemplo de componente com cores hardcoded
const ExemploComponenteAntigo: React.FC = () => {
  return (
    <div>
      <Box sx={{ backgroundColor: '#1976d2', color: '#ffffff', p: 2, mb: 2 }}>
        <Typography variant="h5">Título com cor hardcoded</Typography>
      </Box>
      
      <Button sx={{ backgroundColor: '#f50057', color: '#ffffff', mb: 2 }}>
        Botão com cor hardcoded
      </Button>
      
      <Card sx={{ backgroundColor: '#f5f5f5', p: 2 }}>
        <Typography>Conteúdo do card com cor hardcoded</Typography>
      </Card>
    </div>
  );
};

// Exemplo de componente usando o tema
const ExemploComponente: React.FC = () => {
  const theme = useTheme();
  
  return (
    <div>
      <Box sx={{ 
        backgroundColor: theme.palette.primary.main, 
        color: theme.palette.primary.contrastText, 
        p: 2, 
        mb: 2 
      }}>
        <Typography variant="h5">Título usando o tema</Typography>
      </Box>
      
      <Button 
        sx={{ mb: 2 }}
        variant="contained"
        color="secondary"
      >
        Botão usando o tema
      </Button>
      
      <Card sx={{ 
        backgroundColor: theme.palette.background.card, 
        p: 2 
      }}>
        <Typography>Conteúdo do card usando o tema</Typography>
      </Card>
      
      {/* Exemplo usando cores customizadas para chatbot */}
      <Box sx={{ 
        mt: 2,
        p: 2,
        backgroundColor: theme.custom.chatbot.userMessage,
        borderRadius: 2
      }}>
        <Typography>Mensagem do usuário usando tema customizado</Typography>
      </Box>
      
      <Box sx={{ 
        mt: 2,
        p: 2,
        backgroundColor: theme.custom.chatbot.botMessage,
        borderRadius: 2
      }}>
        <Typography>Resposta do chatbot usando tema customizado</Typography>
      </Box>
    </div>
  );
};

export default ExemploComponente;