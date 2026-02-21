import { createClient } from '../supabase/server'
import { cookies } from 'next/headers'
import { UserRole, UserSession } from '../types'
import { redirect } from 'next/navigation'

export async function getCurrentUser(): Promise<UserSession | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const cookieStore = await cookies()
  const roleCookie = cookieStore.get('user_role')?.value as UserRole | undefined

  return {
    id: user.id,
    email: user.email!,
    role: roleCookie || 'ADMINISTRADOR_PRINCIPAL', // Default role for now
  }
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect('/dashboard') // Redireciona para o dashboard padrão se não tiver permissão
  }

  return user
}
