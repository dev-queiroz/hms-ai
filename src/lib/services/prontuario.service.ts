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
    const supabase = await createClient()

    // @ts-ignore
    const { data: prontuarios, error } = await supabase
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

    // Collect all unique professional_ids to batch-fetch names in one query
    const professionalIds = new Set<string>()
    for (const p of prontuarios || []) {
      if (!p.history) continue
      const arr = Array.isArray(p.history) ? p.history : [p.history]
      for (const entry of arr) {
        if ((entry as any).professional_id) professionalIds.add((entry as any).professional_id)
      }
    }

    // Fetch professional names in one query
    const profMap: Record<string, string> = {}
    if (professionalIds.size > 0) {
      const { data: profs } = await (supabase
        .from('professionals') as any)
        .select('id, nome')
        .in('id', Array.from(professionalIds))
      for (const prof of (profs || [])) {
        profMap[prof.id] = prof.nome
      }
    }

    return (prontuarios || []).map((p: any) => {
      let ultimo_profissional = '—'
      let ultimo_cid10 = null
      let ultima_atualizacao = p.updated_at

      if (p.history) {
        const historyArray = Array.isArray(p.history) ? p.history : [p.history]

        if (historyArray.length > 0) {
          const lastEntry = historyArray[historyArray.length - 1] as any
          // Prioritize stored name, then resolve from map, then fallback
          ultimo_profissional =
            lastEntry.profissional ||
            (lastEntry.professional_id ? profMap[lastEntry.professional_id] : null) ||
            '—'
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
