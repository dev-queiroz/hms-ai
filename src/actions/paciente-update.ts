'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const pacienteUpdateSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  cpf: z.string().min(11, 'CPF inválido'),
  sus_number: z.string().min(1, 'Número do SUS obrigatório'),
  rg: z.string().optional(),
  data_nasc: z.string(),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  contato: z.string().min(8, 'Contato obrigatório'),
})

export type UpdatePacienteState = {
  error?: string
  success?: boolean
}

export async function updatePacienteAction(
  id: string,
  prevState: UpdatePacienteState | null,
  formData: FormData
): Promise<UpdatePacienteState> {
  try {
    const rawData = {
      nome: formData.get('nome') as string,
      cpf: formData.get('cpf') as string,
      sus_number: formData.get('sus_number') as string,
      rg: formData.get('rg') as string,
      data_nasc: formData.get('data_nasc') as string,
      endereco: formData.get('endereco') as string,
      contato: formData.get('contato') as string,
    }

    const validated = pacienteUpdateSchema.parse(rawData)
    
    const supabase = await createClient()
    const { error } = await supabase
      .from('patients')
      // @ts-ignore
      .update(validated as any)
      .eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath(`/dashboard/pacientes/${id}`)
    revalidatePath('/dashboard/pacientes')

    return { success: true }
  } catch (error: any) {
    console.error('Erro updatePacienteAction:', error)
    return { error: error.message || 'Erro ao atualizar paciente.' }
  }
}
