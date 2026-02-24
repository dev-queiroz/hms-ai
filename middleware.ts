import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isProtectedApiRoute = pathname.startsWith('/api/protected')

  if ((isDashboardRoute || isProtectedApiRoute) && !user) {
    if (isProtectedApiRoute) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (pathname.startsWith('/login') && user) {
     return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Role-Based Access Control (RBAC)
  // Trust the user_metadata if it exists, otherwise it will fall back to professional role in layout/actions
  const role = user?.user_metadata?.role
  const isAdminRoute = pathname.startsWith('/dashboard/professionals') || pathname.startsWith('/dashboard/unidades') || pathname.startsWith('/register-admin')
  
  if (isAdminRoute && role !== 'ADMINISTRADOR_PRINCIPAL' && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/login',
    '/register-admin',
  ],
}
