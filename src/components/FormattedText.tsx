import React from 'react';
import { Box, Typography } from '@mui/material';

interface FormattedTextProps {
  text: string;
  className?: string;
  type?: 'default' | 'ai' | 'human' | 'received' | 'sent';
  component?: React.ElementType;
}

/**
 * Componente que formata texto com quebras de linha e espaçamento similar ao WhatsApp
 */
export default function FormattedText({ 
  text, 
  className = '', 
  type = 'default',
  component = 'div'
}: FormattedTextProps) {
  // Função para processar o texto e adicionar quebras de linha
  const formatText = (text: string) => {
    // Dividir o texto em parágrafos
    return text.split('\n').map((paragraph, index) => (
      <React.Fragment key={index}>
        {paragraph}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Determinar a classe CSS com base no tipo
  const getTypeClass = () => {
    switch (type) {
      case 'ai':
        return 'whatsapp-message whatsapp-message-ai';
      case 'human':
        return 'whatsapp-message whatsapp-message-human';
      case 'received':
        return 'whatsapp-message whatsapp-message-received';
      case 'sent':
        return 'whatsapp-message whatsapp-message-sent';
      default:
        return '';
    }
  };

  return (
    <Typography
      component={component}
      className={getTypeClass()}
      sx={{ 
        whiteSpace: 'pre-wrap', 
        lineHeight: 1.5,
        ...(className ? { className } : {})
      }}
      variant="body2"
    >
      {formatText(text)}
    </Typography>
  );
}