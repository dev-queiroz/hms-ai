'use server'

import { createClient } from '@/lib/supabase/server'
import { pacienteService } from '@/lib/services/paciente.service'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const triagemSchema = z.object({
  patient_id: z.string().uuid(),
  sintomas: z.string().min(3, 'Descreva os sintomas'),
  pressao_arterial: z.string().optional(),
  temperatura: z.string().optional(),
  frequencia_cardiaca: z.string().optional(),
  saturacao_oxigenio: z.string().optional(),
  nivel_dor: z.string().optional(),
  classificacao_risco: z.string(),
  observacoes: z.string().optional(),
})

export type CreateTriagemActionState = {
  error?: string
  success?: boolean
}

export async function createTriagemAction(
  prevState: CreateTriagemActionState | null,
  formData: FormData
): Promise<CreateTriagemActionState> {
  try {
    const rawData = {
      patient_id: formData.get('patientId') as string,
      sintomas: formData.get('sintomas') as string,
      pressao_arterial: formData.get('pressao_arterial') as string,
      temperatura: formData.get('temperatura') as string,
      frequencia_cardiaca: formData.get('frequencia_cardiaca') as string,
      saturacao_oxigenio: formData.get('saturacao_oxigenio') as string,
      nivel_dor: formData.get('nivel_dor') as string,
      classificacao_risco: formData.get('classificacao_risco') as string,
      observacoes: formData.get('observacoes') as string,
    }

    const validated = triagemSchema.parse(rawData)

    // Pegar profissional logado via Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('Usuário não autenticado')

    // Buscar o registro do profissional na tabela professionals
    const { data: professional } = await (supabase
      .from('professionals') as any)
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (!professional) throw new Error('Apenas profissionais podem realizar triagem')
    
    const dbData = {
      patient_id: validated.patient_id,
      professional_id: professional.id,
      sintomas: validated.sintomas,
      classificacao_risco: validated.classificacao_risco.toLowerCase(),
      sinais_vitais: {
        pressao_arterial: validated.pressao_arterial,
        temperatura: validated.temperatura ? parseFloat(validated.temperatura) : null,
        frequencia_cardiaca: validated.frequencia_cardiaca ? parseInt(validated.frequencia_cardiaca) : null,
        saturacao_oxigenio: validated.saturacao_oxigenio ? parseInt(validated.saturacao_oxigenio) : null,
        nivel_dor: validated.nivel_dor ? parseInt(validated.nivel_dor) : null,
      },
      data_hora: new Date().toISOString()
    }

    await pacienteService.createTriagem(dbData as any)
    
    revalidatePath(`/dashboard/pacientes/${validated.patient_id}`)
    revalidatePath('/dashboard/triagens')

    return { success: true }
  } catch (error: any) {
    console.error('Erro createTriagemAction:', error)
    return { error: error.message || 'Erro ao salvar triagem.' }
  }
}
