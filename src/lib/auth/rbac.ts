import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type Role = 'ADMINISTRADOR_PRINCIPAL' | 'MEDICO' | 'ENFERMEIRO' | 'TECNICO' | 'RECEPCIONISTA' | 'admin' | 'professional'

export const MEDICAL_ROLES: Role[] = ['MEDICO', 'ENFERMEIRO', 'professional', 'admin', 'ADMINISTRADOR_PRINCIPAL']
export const ADMIN_ROLES: Role[] = ['ADMINISTRADOR_PRINCIPAL', 'admin']

export async function getSession() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getUserRole(userId: string): Promise<Role | null> {
  const { supabaseAdmin } = require('@/lib/supabase/admin')
  const { data, error } = await supabaseAdmin
    .from('professionals')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.role as Role
}

export async function checkPermission(allowedRoles: Role[]) {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }

  const role = await getUserRole(user.id)
  if (!role || !allowedRoles.includes(role)) {
    return { authorized: false, role }
  }

  return { authorized: true, role, user }
}

export async function requirePermission(allowedRoles: Role[]) {
  const { authorized } = await checkPermission(allowedRoles)
  if (!authorized) {
    redirect('/dashboard?error=unauthorized')
  }
}
