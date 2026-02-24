import { createClient } from '@/lib/supabase/server'

export const dashboardService = {
  async getStats() {
    const supabase = await createClient()
    
    // Total de pacientes
    const { count: totalPacientes } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    // Triagens hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const { count: triagensHoje } = await supabase
      .from('triagens')
      .select('*', { count: 'exact', head: true })
      .gte('data_hora', hoje.toISOString())

    // Distribuição de risco atual (simplificado: pegamos as triagens de hoje)
    const { data: riscosHoje } = await supabase
      .from('triagens')
      .select('classificacao_risco')
      .gte('data_hora', hoje.toISOString())

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
