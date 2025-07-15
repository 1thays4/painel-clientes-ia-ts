# Guia de Migração para o Tema MUI Centralizado

Este guia explica como migrar cores hardcoded para o tema centralizado do Material UI no projeto Painel de Clientes IA.

## Estrutura do Tema

O tema está definido em `src/theme/index.ts` e contém:

- Paleta de cores padrão do MUI (primary, secondary, error, etc.)
- Cores de fundo personalizadas
- Tipografia
- Componentes estilizados
- Cores customizadas para chatbot

## Como Migrar Cores Hardcoded

### 1. Importar o hook useTheme

```tsx
import { useTheme } from '@mui/material';

const MeuComponente = () => {
  const theme = useTheme();
  
  // Resto do componente
}
```

### 2. Substituir Cores Hardcoded por Referências ao Tema

#### Antes:
```tsx
<Box sx={{ backgroundColor: '#1976d2', color: '#ffffff' }}>
  Conteúdo
</Box>
```

#### Depois:
```tsx
<Box sx={{ 
  backgroundColor: theme.palette.primary.main, 
  color: theme.palette.primary.contrastText 
}}>
  Conteúdo
</Box>
```

### 3. Usar Propriedades de Componentes MUI

Muitos componentes MUI já aceitam propriedades como `color` e `variant` que usam o tema automaticamente:

#### Antes:
```tsx
<Button sx={{ backgroundColor: '#f50057', color: '#ffffff' }}>
  Botão
</Button>
```

#### Depois:
```tsx
<Button variant="contained" color="secondary">
  Botão
</Button>
```

### 4. Usar Cores Customizadas para Chatbot

```tsx
<Box sx={{ backgroundColor: theme.custom.chatbot.userMessage }}>
  Mensagem do usuário
</Box>
```

## Mapeamento de Cores Comuns

| Cor Hardcoded | Referência no Tema |
|---------------|-------------------|
| #1976d2       | theme.palette.primary.main |
| #42a5f5       | theme.palette.primary.light |
| #1565c0       | theme.palette.primary.dark |
| #ffffff       | theme.palette.primary.contrastText |
| #f50057       | theme.palette.secondary.main |
| #f5f5f5       | theme.palette.background.default |
| #4caf50       | theme.palette.success.main |
| #ff9800       | theme.palette.warning.main |
| #f44336       | theme.palette.error.main |

## Cores Customizadas para Chatbot

| Uso | Referência no Tema |
|-----|-------------------|
| Mensagem do usuário | theme.custom.chatbot.userMessage |
| Mensagem do bot | theme.custom.chatbot.botMessage |
| Timestamp | theme.custom.chatbot.timestamp |
| Botão de ação | theme.custom.chatbot.actionButton |

## Boas Práticas

1. **Nunca use cores hardcoded** - Sempre use referências ao tema
2. **Use variantes de componentes** - Prefira `color="primary"` a definir cores manualmente
3. **Mantenha o tema atualizado** - Adicione novas cores ao tema central em vez de usá-las diretamente
4. **Use alpha para transparência** - Use `alpha(theme.palette.primary.main, 0.1)` para criar versões transparentes
5. **Documente novas cores** - Ao adicionar cores ao tema, documente seu propósito

## Exemplo Completo

```tsx
import React from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';

const ExemploComponente = () => {
  const theme = useTheme();
  
  return (
    <Box>
      {/* Usando cores do tema */}
      <Typography 
        variant="h5" 
        sx={{ 
          color: theme.palette.primary.main,
          backgroundColor: theme.palette.background.paper,
          p: 2
        }}
      >
        Título usando o tema
      </Typography>
      
      {/* Usando propriedades de componente */}
      <Button variant="contained" color="secondary">
        Botão usando o tema
      </Button>
      
      {/* Usando cores customizadas */}
      <Box sx={{ 
        backgroundColor: theme.custom.chatbot.botMessage,
        p: 2,
        borderRadius: 2
      }}>
        Mensagem do chatbot
      </Box>
    </Box>
  );
};
```

## Próximos Passos

1. Identifique todos os componentes com cores hardcoded
2. Migre-os para usar o tema centralizado
3. Adicione novas cores ao tema conforme necessário
4. Revise e teste para garantir consistência visual