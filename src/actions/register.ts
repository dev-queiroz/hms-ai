'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const registerSchema = z.object({
  fullName: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  crm_coren: z.string().min(1, 'CRM/COREN obrigatório'),
  especializacao: z.string().optional(),
  cargo: z.string().optional(),
  role: z.enum(['admin', 'professional']).default('professional'),
  adminSecret: z.string().optional()
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

  // Admins precisam da chave secreta
  if (parsed.data.role === 'admin') {
    if (parsed.data.adminSecret !== process.env.ADMIN_SECRET) {
      return { error: 'Chave Administrativa inválida.' }
    }
  }

  // Bypass RLS for registration using Service Role Key
  // We use the centralized admin client
  const { supabaseAdmin } = require('@/lib/supabase/admin')

  // 1. Criar Auth User
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      role: parsed.data.role
    }
  })

  if (authError || !authData.user) {
    console.error('Erro de signUp:', authError)
    return { error: 'Falha ao registrar credenciais. ' + (authError?.message || '') }
  }

  // 2. Inserir na tabela professionals com id = auth.user.id (FK primária)
  // @ts-ignore
  const { error: dbError } = await supabaseAdmin.from('professionals').insert([{
    id: authData.user.id,          // PK
    user_id: authData.user.id,     // Link para auth.users.id
    nome: parsed.data.fullName,
    role: parsed.data.role,
    crm_coren: parsed.data.crm_coren,
    especializacao: parsed.data.especializacao || null,
    cargo: parsed.data.cargo || null,
  }])

  if (dbError) {
    console.error('Erro ao salvar profissional:', dbError)
    return { error: 'Usuário criado, mas falha ao vincular perfil: ' + dbError.message }
  }

  return { success: true }
}
