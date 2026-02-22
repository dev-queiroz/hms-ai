import { createClient } from '../supabase/server'

export type ProntuarioSummary = {
  id: string
  patient_id: string
  paciente_nome: string
  paciente_cpf: string
  ultima_atualizacao: string
  ultimo_profissional: string
  ultimo_cid10: string | null
}

export const prontuarioService = {
  async getProntuarios(): Promise<ProntuarioSummary[]> {
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // @ts-ignore
    const { data: prontuarios, error } = await supabaseAdmin
      .from('prontuarios')
      .select(`
        id,
        patient_id,
        history,
        updated_at,
        patients (
          nome,
          cpf
        )
      `)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar prontuários:', error)
      return []
    }

    // Processar para retornar um sumário fácil de exibir na tabela
    return (prontuarios || []).map((p: any) => {
      let ultimo_profissional = '—'
      let ultimo_cid10 = null
      let ultima_atualizacao = p.updated_at

      if (p.history) {
        let historyArray = []
        if (Array.isArray(p.history)) {
          historyArray = p.history
        } else {
          historyArray = [p.history]
        }

        if (historyArray.length > 0) {
          const lastEntry = historyArray[historyArray.length - 1]
          ultimo_profissional = lastEntry.profissional || lastEntry.professional_id || 'Profissional'
          ultimo_cid10 = lastEntry.cid10 || null
          ultima_atualizacao = lastEntry.data || p.updated_at
        }
      }

      return {
        id: p.id,
        patient_id: p.patient_id,
        paciente_nome: p.patients?.nome || 'Paciente Desconhecido',
        paciente_cpf: p.patients?.cpf || '---',
        ultima_atualizacao,
        ultimo_profissional,
        ultimo_cid10
      }
    })
  }
}
