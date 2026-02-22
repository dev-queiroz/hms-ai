'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export type LoginActionState = {
  error?: string
  success?: boolean
}

export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const validatedFields = loginSchema.safeParse({ email, password })

  if (!validatedFields.success) {
    return { error: 'Campos inválidos.' }
  }

  const supabase = await createClient()

  // 1. Tentar autenticar o usuário
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  })

  if (error || !data.user || !data.session) {
    console.error("Auth error details:", error?.message, error);
    return { error: 'Credenciais inválidas. ' + (error?.message || '') }
  }

  // 2. Buscar o papel (role) do funcionário na tabela
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
  
  const { data: professional } = await supabaseAdmin
    .from('professionals')
    .select('role')
    .eq('user_id', data.user.id)
    .single()
    
  const role = professional?.role || 'professional'

  // 3. Definir cookies (Supabase SSR já define os de sessão, mas adicionamos extras se necessário)
  const cookieStore = await cookies()
  cookieStore.set('access_token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  cookieStore.set('user_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  const cookieStore = await cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('user_role')
}

export async function getHeaderUserInfoAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
  const supabaseAdmin = createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
  
  const { data } = await supabaseAdmin
    .from('professionals')
    .select('nome, cargo')
    .eq('user_id', user.id)
    .single()
    
  return data
}
