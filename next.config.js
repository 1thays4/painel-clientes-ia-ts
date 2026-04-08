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
    NEXT_PUBLIC_API_TIMEOUT: '30000',
  },
  // Habilitar export estático (gera pasta `out` no build)
  output: 'export',
};

module.exports = nextConfig;