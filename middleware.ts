import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware para proteger rotas /dashboard/* e redirecionar usuários não autenticados.
 * Também bloqueia rotas /api/protected/*
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const { pathname } = request.nextUrl
  
  // Rotas que devem ser protegidas
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isProtectedApiRoute = pathname.startsWith('/api/protected')

  if ((isDashboardRoute || isProtectedApiRoute) && !token) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se o usuário tentar acessar login estando logado, redireciona para o dashboard
  // Admins logados podem acessar /register-admin para criar novos usuários, mas não-admins são bloqueados
  if (pathname.startsWith('/login') && token) {
     return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Role-Based Access Control (RBAC)
  const role = request.cookies.get('user_role')?.value
  const isAdminRoute = pathname.startsWith('/dashboard/professionals') || pathname.startsWith('/register-admin')
  
  if (isAdminRoute && role !== 'ADMINISTRADOR_PRINCIPAL') {
    // Redireciona usuários sem permissão para o dashboard inicial
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/login',
    '/register-admin',
  ],
}
