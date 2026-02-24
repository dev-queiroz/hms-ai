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

  // Fetch role from the professional table via admin client to bypass RLS for this specific check
  const { supabaseAdmin } = require('../supabase/admin')
  const { data: professional } = await supabaseAdmin
    .from('professionals')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email!,
    role: (professional?.role as UserRole) || 'professional',
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
