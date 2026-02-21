'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CreateNotaState = {
  error?: string
  success?: boolean
}

export async function createNotaAcao(
  prevState: CreateNotaState | null,
  formData: FormData
): Promise<CreateNotaState> {
  try {
    const pacienteId = formData.get('pacienteId') as string
    const descricao = formData.get('descricao') as string

    if (!pacienteId || !descricao) {
      return { error: 'Faltam dados obrigatórios.' }
    }

    const supabase = await createClient()

    // Pegar quem está adicionando a nota
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      return { error: 'Não autorizado' }
    }

    // Tentar pegar os dados do profissional pra carimbar o nome real
    const { data: profData } = await supabase
      .from('professionals')
      .select('nome')
      .eq('user_id', authData.user.id)
      .single()

    // @ts-ignore
    const nomeProfissional = profData?.nome || 'Profissional da Saúde'

    const novaNota = {
      data: new Date().toISOString(),
      profissional: nomeProfissional,
      descricao: descricao
    }

    // Verificar se já existe um prontuário pra este paciente
    const { data: prontuarioE } = await supabase
      .from('prontuarios')
      .select('id, history')
      .eq('patient_id', pacienteId)
      .single()

    let errorToThrow = null

    if (prontuarioE) {
      // Já tem prontuário, fazer push na array history
      // Garantir que é um array, senão cria um array com os itens existentes mais o novo
      let novoHistorico = []
      const historyRaw = (prontuarioE as any).history
      if (Array.isArray(historyRaw)) {
        novoHistorico = [...historyRaw, novaNota]
      } else if (historyRaw) {
        novoHistorico = [historyRaw, novaNota]
      } else {
        novoHistorico = [novaNota]
      }

      const { error } = await supabase
        .from('prontuarios')
        // @ts-ignore
        .update({ history: novoHistorico, updated_at: new Date().toISOString() })
        .eq('id', (prontuarioE as any).id)
      
      errorToThrow = error
    } else {
      // Não tem prontuário, criar um novo
      const { error } = await supabase
        .from('prontuarios')
        // @ts-ignore
        .insert([{
          patient_id: pacienteId,
          history: [novaNota]
        }])
        
      errorToThrow = error
    }

    if (errorToThrow) {
      console.error('Erro ao salvar nota:', errorToThrow)
      return { error: 'Falha ao salvar no banco.' }
    }
    
    // Revalidar cash da página de detalhes pra nota aparecer na hora
    revalidatePath(`/dashboard/pacientes/${pacienteId}`)

    return { success: true }
  } catch (error: any) {
    console.error('Erro createNotaAcao:', error)
    return { error: error.message || 'Erro inesperado ao salvar nota.' }
  }
}
