import { createTheme, ThemeOptions } from "@mui/material/styles";
import { PaletteOptions } from "@mui/material/styles/createPalette";

// Definindo as cores principais do sistema
const colors = {
  // Cores primárias
  primary: {
    main: "#1976d2",
    light: "#42a5f5",
    dark: "#1565c0",
    contrastText: "#ffffff",
  },
  // Cores secundárias
  secondary: {
    main: "#f50057",
    light: "#ff4081",
    dark: "#c51162",
    contrastText: "#ffffff",
  },
  // Cores de fundo
  background: {
    default: "#f5f5f5",
    paper: "#ffffff",
    card: "#f5f5f5",
  },
  // Cores de texto
  text: {
    primary: "#333333",
    secondary: "#757575",
  },
  // Cores de status
  status: {
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",
  },
  // Cores específicas para chatbot
  chatbot: {
    userMessage: "#e3f2fd",
    botMessage: "#f1f8e9",
    timestamp: "#9e9e9e",
    actionButton: "#bbdefb",
  },
};

// Definindo a paleta de cores
const palette: PaletteOptions = {
  primary: colors.primary,
  secondary: colors.secondary,
  background: colors.background,
  text: colors.text,
  error: {
    main: colors.status.error,
  },
  warning: {
    main: colors.status.warning,
  },
  info: {
    main: colors.status.info,
  },
  success: {
    main: colors.status.success,
  },
};

// Definindo as opções do tema
const themeOptions: ThemeOptions = {
  palette,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  // Adicionando propriedades customizadas ao tema
  custom: {
    chatbot: colors.chatbot,
  },
};

// Declaração para estender o tema com propriedades customizadas
declare module "@mui/material/styles" {
  interface Theme {
    custom: {
      chatbot: {
        userMessage: string;
        botMessage: string;
        timestamp: string;
        actionButton: string;
      };
    };
  }

  interface ThemeOptions {
    custom?: {
      chatbot?: {
        userMessage?: string;
        botMessage?: string;
        timestamp?: string;
        actionButton?: string;
      };
    };
  }
}

// Criando o tema
const theme = createTheme(themeOptions);

export default theme;
