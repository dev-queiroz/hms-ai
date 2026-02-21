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

export type CreateTriagemState = {
  error?: string
  success?: boolean
}

export async function createTriagemAction(
  prevState: CreateTriagemState | null,
  formData: FormData
): Promise<CreateTriagemState> {
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

    // Pegar profissional logado
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    
    // Buscar o registro do profissional na tabela professionals pelo auth.uid()
    let professionalId: string | null = null
    if (authData.user?.id) {
      const { data: professional } = await supabase
        .from('professionals')
        .select('id')
        .eq('id', authData.user.id)
        .single()
      
      if (professional) {
        professionalId = (professional as any).id
      }
    }
    
    const dbData: any = {
      patient_id: validated.patient_id,
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

    // Só adiciona professional_id se o profissional existe no banco
    if (professionalId) {
      dbData.professional_id = professionalId
    }

    await pacienteService.createTriagem(dbData)
    
    revalidatePath(`/dashboard/pacientes/${validated.patient_id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Erro createTriagemAction:', error)
    return { error: error.message || 'Erro ao salvar triagem.' }
  }
}
