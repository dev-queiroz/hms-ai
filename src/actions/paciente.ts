'use server'

import { z } from 'zod'
import { pacienteService } from '@/lib/services/paciente.service'
import { revalidatePath } from 'next/cache'

const pacienteSchema = z.object({
  nome: z.string().min(3, 'Nome muito curto'),
  cpf: z.string().min(11, 'CPF inválido'),
  sus_number: z.string().min(1, 'Número do SUS obrigatório'),
  rg: z.string().optional(),
  data_nasc: z.string(),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  contato: z.string().min(8, 'Contato obrigatório'),
})

export type CreatePacienteState = {
  error?: string
  success?: boolean
}

export async function createPacienteAction(
  prevState: CreatePacienteState | null,
  formData: FormData
): Promise<CreatePacienteState> {
  try {
    const data = {
      nome: formData.get('nome') as string,
      cpf: formData.get('cpf') as string,
      sus_number: formData.get('sus_number') as string,
      rg: formData.get('rg') as string,
      data_nasc: formData.get('data_nasc') as string,
      endereco: formData.get('endereco') as string,
      contato: formData.get('contato') as string,
    }

    const validated = pacienteSchema.parse(data)

    await pacienteService.createPaciente(validated)
    
    // Revalidar cache da lista de pacientes
    revalidatePath('/dashboard/pacientes')

    return { success: true }
  } catch (error: any) {
    console.error('Erro createPacienteAction:', error)
    return { error: error.message || 'Erro ao cadastrar paciente.' }
  }
}
