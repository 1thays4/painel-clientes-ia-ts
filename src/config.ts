// Configurações da aplicação
export const config = {
  supabase: {
    url: process.env.REACT_APP_SUPABASE_URL || "",
    key: process.env.REACT_APP_SUPABASE_KEY || ""
  },
  api: {
    baseUrl: "/api"
  },
  planos: {
    essencial: {
      preco: 197,
      limite: 1000
    },
    Profissional: {
      preco: 247,
      limite: 3000
    },
    Estratégico: {
      preco: 297,
      limite: 5000
    }
  },
  // Configurações da API de IA
  IA_API_URL: process.env.REACT_APP_IA_API_URL || "https://api.openai.com/v1/chat/completions",
  IA_API_KEY: process.env.REACT_APP_IA_API_KEY || "",
  IA_MODEL: process.env.REACT_APP_IA_MODEL || "gpt-3.5-turbo",
  // Configurações do webhook do n8n
  N8N_WEBHOOK_URL: process.env.REACT_APP_N8N_WEBHOOK_URL || "https://n8n.thaysautomacao.com/webhook/whatsapp-resposta",
  N8N_WEBHOOK_METHOD: process.env.REACT_APP_N8N_WEBHOOK_METHOD || "POST"
};