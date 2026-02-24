'use server'

import { professionalsService } from '@/lib/services/professionals.service'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const professionalSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cargo: z.string().optional(),
  especializacao: z.string().optional(),
  role: z.enum(['admin', 'professional']),
  unidade_saude_id: z.string().uuid('Unidade de Saúde inválida').optional().nullable(),
})

export async function updateProfessionalAction(id: string, prevState: any, formData: FormData) {
  const data = {
    nome: formData.get('nome') as string,
    cargo: formData.get('cargo') as string,
    especializacao: formData.get('especializacao') as string,
    role: formData.get('role') as string,
    unidade_saude_id: formData.get('unidade_saude_id') as string || null,
  }

  const parsed = professionalSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await professionalsService.updateProfessional(id, parsed.data)
    revalidatePath('/dashboard/professionals')
    revalidatePath('/dashboard/perfil')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar profissional' }
  }
}

export async function createProfessionalAction(prevState: any, formData: FormData) {
  const data = {
    nome: formData.get('nome') as string,
    cargo: formData.get('cargo') as string,
    especializacao: formData.get('especializacao') as string,
    role: formData.get('role') as string,
    unidade_saude_id: formData.get('unidade_saude_id') as string || null,
  }

  const parsed = professionalSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await professionalsService.createProfessional(parsed.data as any)
    revalidatePath('/dashboard/professionals')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar profissional' }
  }
}

export async function deleteProfessionalAction(id: string) {
  try {
    await professionalsService.deleteProfessional(id)
    revalidatePath('/dashboard/professionals')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao excluir profissional' }
  }
}
