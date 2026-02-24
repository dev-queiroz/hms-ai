import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/supabase'

type AgendamentoInsert = Database['public']['Tables']['agendamentos']['Insert']
type AgendamentoRow = Database['public']['Tables']['agendamentos']['Row']

export const consultaService = {
  async createConsulta(data: {
    pacienteId: string;
    unidadeSaudeId: string | null;
    observacoes: string;
    cid10?: string;
  }) {
    const supabase = await createClient()

    // 1. Get logged-in professional
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: professional } = await (supabase
      .from('professionals') as any)
      .select('id, role, unidade_saude_id')
      .eq('user_id', authData.user.id)
      .single()

    if (!professional) {
      throw new Error('Apenas profissionais podem criar consultas')
    }

    const prof = professional as any

    // 2. Resolve unidade_saude_id - if professional has no unit, fetch the first available
    let unidadeId = data.unidadeSaudeId || prof.unidade_saude_id
    if (!unidadeId) {
      const { data: anyUnidade } = await supabase
        .from('unidades_saude')
        .select('id')
        .limit(1)
        .single()
      unidadeId = (anyUnidade as any)?.id || null
    }

    if (!unidadeId) {
      throw new Error('Nenhuma unidade de saúde disponível. Cadastre uma unidade primeiro.')
    }

    const { data: agendamento, error: agendamentoError } = await supabase
      .from('agendamentos')
      .insert({
        patient_id: data.pacienteId,
        professional_id: prof.id,
        id_unidades_saude: unidadeId,
        tipo: 'Consulta',
        prioridade: false,
        data_hora: new Date().toISOString()
      } as any)
      .select()
      .single()

    if (agendamentoError) {
      throw new Error(`Erro ao criar agendamento: ${agendamentoError.message}`)
    }

    // 3. Create or Update Prontuário with Observations and CID-10
    const historyEntry = {
      data: new Date().toISOString(),
      professional_id: prof.id,
      observacoes: data.observacoes,
      cid10: data.cid10 || null,
      tipo: 'Consulta'
    }

    // Verify if prontuario exists
    const { data: existingProntuario } = await (supabase
      .from('prontuarios') as any)
      .select('id, history')
      .eq('patient_id', data.pacienteId)
      .single()

    if (existingProntuario) {
      const ep = existingProntuario as any
      // Append to JSONB
      let newHistory = []
      if (Array.isArray(ep.history)) {
        newHistory = [...ep.history, historyEntry]
      } else {
        newHistory = [ep.history, historyEntry]
      }

      await (supabase
        .from('prontuarios') as any)
        .update({
          history: newHistory,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', ep.id)
    } else {
      // Create new Prontuario
      const { error: prontuarioError } = await supabase
        .from('prontuarios')
        .insert({
          patient_id: data.pacienteId,
          history: [historyEntry],
          updated_at: new Date().toISOString()
        } as any)

      if (prontuarioError) {
        console.error('Erro ao criar prontuário:', prontuarioError)
      }
    }

    return agendamento
  },

  async getConsultas(page: number = 1, limit: number = 10, search?: string) {
    const supabase = await createClient()

    let query = supabase
      .from('agendamentos')
      .select(`
        *,
        patients ( nome ),
        professionals ( nome )
      `, { count: 'exact' })
      .order('data_hora', { ascending: false })
      .eq('tipo', 'Consulta')

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Erro ao buscar consultas:', error)
      return { data: [], count: 0 }
    }

    return { data: data || [], count: count || 0 }
  },

  async getConsultaById(id: string) {
    const supabase = await createClient()

    const { data: agendamento, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        patients ( id, nome, cpf, sus_number ),
        professionals ( id, nome, crm_coren )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar consulta:', error)
      return null
    }

    const data = agendamento as any
    
    // Attempt to get the matching prontuario entry to extract observacoes and cid10
    let observacoes = null;
    let cid10 = null;
    
    if (data.patient_id) {
       const { data: prontuario } = await supabase
         .from('prontuarios')
         .select('history')
         .eq('patient_id', data.patient_id)
         .single()
         
       const p = prontuario as any
       if (p && Array.isArray(p.history)) {
          // find the entry that roughly matches the agendamento data_hora, or the latest "Consulta"
          const entry = [...p.history].reverse().find((item: any) => item.tipo === 'Consulta' && item.professional_id === data.professional_id)
          if (entry) {
             observacoes = entry.observacoes
             cid10 = entry.cid10
          }
       }
    }

    return {
       ...data,
       observacoes,
       cid10
    }
  },

  async updateConsulta(id: string, data: { observacoes: string; cid10?: string }) {
    const supabase = await createClient()
    
    // 1. Get the agendamento to find the patient and professional
    const { data: agendamento } = await supabase
      .from('agendamentos')
      .select('patient_id, professional_id')
      .eq('id', id)
      .single()

    if (!agendamento) throw new Error('Consulta não encontrada')

    const { patient_id, professional_id } = agendamento as any

    // 2. Update Prontuário history
    const { data: prontuario } = await supabase
      .from('prontuarios')
      .select('id, history')
      .eq('patient_id', patient_id)
      .single()

    if (prontuario) {
       const p = prontuario as any
       if (Array.isArray(p.history)) {
          // Find the entry for this specific professional and update it
          // In a real system we'd have a stable ID for history entries, 
          // here we assume it's the latest one for this professional.
          const newHistory = [...p.history]
          const index = [...newHistory].reverse().findIndex((item: any) => item.tipo === 'Consulta' && item.professional_id === professional_id)
          
          if (index !== -1) {
             const actualIndex = newHistory.length - 1 - index
             newHistory[actualIndex] = {
                ...newHistory[actualIndex],
                observacoes: data.observacoes,
                cid10: data.cid10 || null,
                updated_at: new Date().toISOString()
             }

             await (supabase
               .from('prontuarios') as any)
               .update({ history: newHistory } as any)
               .eq('id', p.id)
          }
       }
    }

    return { success: true }
  },

  async deleteConsulta(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(error.message)
    return { success: true }
  }
}
