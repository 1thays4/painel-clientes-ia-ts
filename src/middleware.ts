import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware para proteção de rotas
export function middleware(request: NextRequest) {
  return NextResponse.next();
 /*  // Exemplo de middleware para verificar autenticação
  // Você pode adaptar conforme necessário para seu sistema de autenticação
  
  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/registro');
  
  // Se não há token e não é uma página de autenticação, redireciona para login
  if (!token && !isAuthPage && !request.nextUrl.pathname.startsWith('/cliente/')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Se há token e está tentando acessar página de autenticação, redireciona para dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next(); */
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|notification.js).*)',
  ],
};