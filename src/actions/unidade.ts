'use server'

import { unidadeService } from '@/lib/services/unidade.service'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const unidadeSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  tipo: z.string().min(1, 'Tipo de unidade é obrigatório'),
  endereco: z.string().min(5, 'Endereço é obrigatório'),
  contato: z.string().min(5, 'Contato é obrigatório'),
  responsavel_id: z.string().uuid().optional().nullable(),
})

export async function createUnidadeAction(prevState: any, formData: FormData) {
  const data = {
    nome: formData.get('nome') as string,
    tipo: formData.get('tipo') as string,
    endereco: formData.get('endereco') as string,
    contato: formData.get('contato') as string,
    responsavel_id: formData.get('responsavel_id') as string || null,
  }

  const parsed = unidadeSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await unidadeService.createUnidade(parsed.data)
    revalidatePath('/dashboard/unidades')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar unidade' }
  }
}

export async function updateUnidadeAction(id: string, prevState: any, formData: FormData) {
  const data = {
    nome: formData.get('nome') as string,
    tipo: formData.get('tipo') as string,
    endereco: formData.get('endereco') as string,
    contato: formData.get('contato') as string,
    responsavel_id: formData.get('responsavel_id') as string || null,
  }

  const parsed = unidadeSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  try {
    await unidadeService.updateUnidade(id, parsed.data)
    revalidatePath('/dashboard/unidades')
    revalidatePath(`/dashboard/unidades/${id}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar unidade' }
  }
}
