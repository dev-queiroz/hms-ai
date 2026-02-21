'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  adminSecret: z.string()
})

export type RegisterState = {
  error?: string
  success?: boolean
}

export async function registerAdminAction(
  prevState: RegisterState | null,
  formData: FormData
): Promise<RegisterState> {
  const data = Object.fromEntries(formData.entries())
  const parsed = registerSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  if (parsed.data.adminSecret !== process.env.ADMIN_SECRET) {
    return { error: 'Chave Administrativa inválida.' }
  }

  const supabase = await createClient()

  // 1. Criar Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        role: 'ADMINISTRADOR_PRINCIPAL'
      }
    }
  })

  if (authError || !authData.user) {
    console.error('Erro de signUp admin:', authError)
    return { error: 'Falha ao registrar credenciais. ' + (authError?.message || '') }
  }

  // 2. Inserir na tabela public.professionals com os mesmos dados mapeados
  // @ts-ignore
  const { error: dbError } = await supabase.from('professionals').insert([{
    user_id: authData.user.id,
    nome: parsed.data.fullName,
    role: 'ADMINISTRADOR_PRINCIPAL',
    crm_coren: 'ADMIN-000',
    cargo: 'Administrador do Sistema'
  }])

  if (dbError) {
    console.error('Erro ao salvar info do profissional:', dbError)
    return { error: 'Usuário cadastrado, mas falha ao vincular perfil.' }
  }

  return { success: true }
}
