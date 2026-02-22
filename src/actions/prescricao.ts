'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prescricaoService } from '@/lib/services/prescricao.service'

const medicamentoSchema = z.object({
  nome: z.string().min(1, 'Nome do medicamento é obrigatório'),
  dosagem: z.string().min(1, 'Dosagem é obrigatória'),
  frequencia: z.string().min(1, 'Frequência é obrigatória'),
  via: z.string().optional()
})

const createPrescricaoSchema = z.object({
  pacienteId: z.string().uuid('ID do paciente inválido'),
  medicamentosJson: z.string().min(1, 'Adicione pelo menos um medicamento'),
  observacoes: z.string().optional(),
  cid10: z.string().optional()
})

export type CreatePrescricaoState = {
  error?: string
  success?: boolean
}

export async function createPrescricaoAction(
  prevState: CreatePrescricaoState | null,
  formData: FormData
): Promise<CreatePrescricaoState> {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const validated = createPrescricaoSchema.parse(rawData)

    let medicamentos = []
    try {
      medicamentos = JSON.parse(validated.medicamentosJson)
      if (!Array.isArray(medicamentos) || medicamentos.length === 0) {
        throw new Error()
      }
    } catch {
      return { error: 'Formato de medicamentos inválido.' }
    }

    await prescricaoService.createPrescricao({
      pacienteId: validated.pacienteId,
      medicamentos,
      observacoes: validated.observacoes,
      cid10: validated.cid10
    })

    revalidatePath('/dashboard/prescricoes')
    revalidatePath(`/dashboard/pacientes/${validated.pacienteId}`)

    return { success: true }
  } catch (error: any) {
    console.error('Erro em createPrescricaoAction:', error)
    if (error instanceof z.ZodError) {
      return { error: (error as any).errors[0].message }
    }
    return { error: error.message || 'Erro ao criar prescrição' }
  }
}
