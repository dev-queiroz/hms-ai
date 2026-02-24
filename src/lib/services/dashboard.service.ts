import { createClient } from '@/lib/supabase/server'

export const dashboardService = {
  async getStats(unidadeId?: string) {
    const supabase = await createClient()
    
    // 1. Total de pacientes (Global ou por Unidade via Triagens/Consultas?)
    // Para simplificar, mantemos Global ou filtramos se houver associação clara.
    // Patients don't have unit_id directly, they are linked via incidents/triage.
    // For now, let's keep patients global or try to filter by those who had interactions in the unit.
    
    let statsQuery = supabase.from('patients').select('*', { count: 'exact', head: true })
    if (unidadeId) {
       // Deep filter is complex with current schema, keeping global for now or filter by interactions
    }
    const { count: totalPacientes } = await statsQuery

    // 2. Triagens hoje (Filtrado por Unidade)
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    
    let triagensQuery = supabase
      .from('triagens')
      .select('classificacao_risco', { count: 'exact' })
      .gte('data_hora', hoje.toISOString())

    if (unidadeId) {
        // We might need to join with professionals or have unit_id on triage.
        // Checking if triagens has unidad_saude_id (it should ideally)
        triagensQuery = triagensQuery.eq('unidade_saude_id', unidadeId)
    }

    const { data: riscosHoje, count: triagensHoje } = await triagensQuery

    const totalRiscos = riscosHoje?.length || 0
    const criticos = riscosHoje?.filter((t: any) => t.classificacao_risco === 'Vermelho' || t.classificacao_risco === 'Laranja').length || 0

    return {
      totalPacientes: totalPacientes || 0,
      triagensHoje: triagensHoje || 0,
      criticosHoje: criticos,
      taxaRisco: totalRiscos > 0 ? Math.round((criticos / totalRiscos) * 100) : 0
    }
  }
}
