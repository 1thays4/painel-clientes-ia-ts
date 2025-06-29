# Implementação do Material UI

Este projeto foi atualizado para usar o Material UI, uma biblioteca de componentes React que implementa o Material Design do Google.

## Mudanças Realizadas

1. **Adição de Dependências**:
   - @mui/material
   - @emotion/react
   - @emotion/styled
   - @mui/icons-material

2. **Componentes Atualizados**:
   - App.tsx: Adicionado ThemeProvider e tema personalizado
   - Login.tsx: Convertido para usar componentes Material UI
   - Dashboard.tsx: Atualizado para usar Grid, Card, Typography e outros componentes do Material UI
   - PainelClientesIA.tsx: Implementado o novo layout com AppBar e Drawer

3. **Novos Componentes**:
   - MuiLayout.tsx: Componente de layout com AppBar, Drawer e menu de navegação

## Como Executar

1. Execute o arquivo `install-mui.bat` para instalar as dependências do Material UI ou execute o comando:
   ```
   npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
   ```

2. Inicie o projeto normalmente:
   ```
   npm start
   ```

## Personalização do Tema

O tema do Material UI está configurado no arquivo `App.tsx`. Você pode personalizar as cores, tipografia e outros aspectos do tema editando o objeto `theme`.

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Cor primária
    },
    secondary: {
      main: '#f50057', // Cor secundária
    },
    // Outras configurações de cores
  },
  // Outras configurações do tema
});
```

## Componentes Disponíveis

O Material UI oferece uma ampla gama de componentes que você pode usar em seu projeto:

- Componentes de Layout: Container, Grid, Box
- Componentes de Navegação: AppBar, Drawer, Menu, Tabs
- Componentes de Feedback: Alert, Dialog, Progress, Snackbar
- Componentes de Entrada: Button, TextField, Select, Checkbox
- Componentes de Exibição: Typography, Card, List, Table

Consulte a [documentação oficial do Material UI](https://mui.com/material-ui/getting-started/) para mais informações sobre como usar esses componentes.

## Próximos Passos

1. Continuar a migração de outros componentes para o Material UI
2. Implementar temas claro/escuro
3. Melhorar a responsividade em dispositivos móveis
4. Adicionar mais animações e transições