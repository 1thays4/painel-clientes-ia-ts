import React from 'react';
import '../styles/message-styles.css';

interface FormattedTextProps {
  text: string;
  className?: string;
  type?: 'default' | 'ai' | 'human' | 'received' | 'sent';
}

/**
 * Componente que formata texto com quebras de linha e espaçamento similar ao WhatsApp
 */
export default function FormattedText({ text, className = '', type = 'default' }: FormattedTextProps) {
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
    <div className={`whitespace-pre-wrap ${getTypeClass()} ${className}`} style={{ lineHeight: '1.5' }}>
      {formatText(text)}
    </div>
  );
}