'use server'

import { consultaService } from '@/lib/services/consulta.service'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createConsultaSchema = z.object({
  pacienteId: z.string().uuid(),
  unidadeSaudeId: z.string().uuid().optional().nullable().or(z.literal('')),
  observacoes: z.string().min(10, 'Observações devem ter pelo menos 10 caracteres'),
  cid10: z.string().optional(),
})

export type CreateConsultaState = {
  error?: string
  success?: boolean
}

export async function createConsultaAction(
  prevState: CreateConsultaState | null,
  formData: FormData
): Promise<CreateConsultaState> {
  try {
    const rawData = {
      pacienteId: formData.get('pacienteId') as string,
      unidadeSaudeId: formData.get('unidadeSaudeId') as string,
      observacoes: formData.get('observacoes') as string,
      cid10: formData.get('cid10') as string,
    }

    const validated = createConsultaSchema.parse(rawData)

    await consultaService.createConsulta({
       pacienteId: validated.pacienteId,
       unidadeSaudeId: (validated.unidadeSaudeId as (string | null)) || null,
       observacoes: validated.observacoes,
       cid10: validated.cid10
    })

    revalidatePath('/dashboard/consultas')
    revalidatePath(`/dashboard/pacientes/${validated.pacienteId}`)

    return { success: true }
  } catch (error: any) {
    console.error('Erro createConsultaAction:', error)
    return { error: error.message || 'Erro ao registrar consulta.' }
  }
}
