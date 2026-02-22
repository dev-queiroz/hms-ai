import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/supabase'

type AgendamentoInsert = Database['public']['Tables']['agendamentos']['Insert']
type AgendamentoRow = Database['public']['Tables']['agendamentos']['Row']

export const consultaService = {
  async createConsulta(data: {
    pacienteId: string;
    unidadeSaudeId: string;
    observacoes: string;
    cid10?: string;
  }) {
    const supabase = await createClient()

    // 1. Get logged-in professional
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: professional } = await supabase
      .from('professionals')
      .select('id, role, unidade_saude_id')
      .eq('user_id', authData.user.id)
      .single()

    if (!professional) {
      throw new Error('Apenas profissionais podem criar consultas')
    }

    // 2. Create Agendamento (Consulta)
    // @ts-ignore
    const { data: agendamento, error: agendamentoError } = await supabase
      .from('agendamentos')
      // @ts-ignore
      .insert({
        patient_id: data.pacienteId,
        professional_id: (professional as any).id,
        id_unidades_saude: data.unidadeSaudeId,
        tipo: 'Consulta',
        prioridade: false,
        data_hora: new Date().toISOString()
      })
      .select()
      .single()

    if (agendamentoError) {
      throw new Error(`Erro ao criar agendamento: ${agendamentoError.message}`)
    }

    // 3. Create or Update Prontuário with Observations and CID-10
    const historyEntry = {
      data: new Date().toISOString(),
      professional_id: (professional as any).id,
      observacoes: data.observacoes,
      cid10: data.cid10 || null,
      tipo: 'Consulta'
    }

    // Verify if prontuario exists
    // @ts-ignore
    const { data: existingProntuario } = await supabase
      .from('prontuarios')
      .select('id, history')
      // @ts-ignore
      .eq('patient_id', data.pacienteId)
      .single()

    if (existingProntuario) {
      // Append to JSONB
      // Assuming history is an array of objects
      let newHistory = []
      // @ts-ignore
      if (Array.isArray(existingProntuario.history)) {
        // @ts-ignore
        newHistory = [...existingProntuario.history, historyEntry]
      } else {
        // @ts-ignore
        newHistory = [existingProntuario.history, historyEntry]
      }

      // @ts-ignore
      await supabase
        .from('prontuarios')
        // @ts-ignore
        .update({
          history: newHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', (existingProntuario as any).id)
    } else {
      // Create new Prontuario
      // @ts-ignore
      const { error: prontuarioError } = await supabase
        .from('prontuarios')
        // @ts-ignore
        .insert({
          patient_id: data.pacienteId,
          history: [historyEntry],
          updated_at: new Date().toISOString()
        })

      if (prontuarioError) {
        console.error('Erro ao criar prontuário:', prontuarioError)
      }
    }

    return agendamento
  },

  async getConsultas(page: number = 1, limit: number = 10, search?: string) {
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    let query = supabaseAdmin
      .from('agendamentos')
      .select(`
        *,
        patients ( nome ),
        professionals ( nome )
      `, { count: 'exact' })
      .order('data_hora', { ascending: false })
      .eq('tipo', 'Consulta')

    // Note: search in Supabase connected tables is a bit trickier with postgrest JS. 
    // We would need a view or perform filtering locally if it's simple string search.

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
    // @ts-ignore
    const { data: agendamento, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        patients ( nome, cpf, sus_number ),
        professionals ( nome, crm_coren )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar consulta:', error)
      return null
    }
    
    // Attempt to get the matching prontuario entry to extract observacoes and cid10
    let observacoes = null;
    let cid10 = null;
    
    // @ts-ignore
    if (agendamento.patient_id) {
       // @ts-ignore
       const { data: prontuario } = await supabase
         .from('prontuarios')
         .select('history')
         // @ts-ignore
         .eq('patient_id', agendamento.patient_id)
         .single()
         
       // @ts-ignore
       if (prontuario && Array.isArray(prontuario.history)) {
          // find the entry that roughly matches the agendamento data_hora, or the latest "Consulta"
          // @ts-ignore
          const entry = prontuario.history.reverse().find((item: any) => item.tipo === 'Consulta' && item.professional_id === agendamento.professional_id)
          if (entry) {
             observacoes = entry.observacoes
             cid10 = entry.cid10
          }
       }
    }

    return {
       // @ts-ignore
       ...agendamento,
       observacoes,
       cid10
    }
  }
}
