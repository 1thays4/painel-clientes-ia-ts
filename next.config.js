/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuração para API routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Expor variáveis de ambiente para o cliente
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY: process.env.REACT_APP_SUPABASE_KEY,
  },
  // Aumentar o timeout para evitar erros de conexão
  serverRuntimeConfig: {
    timeout: 60000,
  },
  // Configurações públicas
  publicRuntimeConfig: {
    apiTimeout: 30000,
  },
};

module.exports = nextConfig;