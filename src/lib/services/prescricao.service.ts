import { createClient } from '../supabase/server'

export type PrescricaoSummary = {
  id: string
  patient_id: string
  paciente_nome: string
  profissional_id: string
  medico_nome: string
  detalhes: any
  data_criacao: string
}

export const prescricaoService = {
  async getPrescricoes(): Promise<PrescricaoSummary[]> {
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // @ts-ignore
    const { data: prescricoes, error } = await supabaseAdmin
      .from('prescricoes')
      .select(`
        *,
        patients ( nome ),
        professionals ( nome )
      `)
      .order('data', { ascending: false })

    if (error) {
      console.error('Erro ao buscar prescrições:', error)
      return []
    }

    return (prescricoes || []).map((p: any) => ({
      id: p.id,
      patient_id: p.patient_id,
      paciente_nome: p.patients?.nome || 'Desconhecido',
      profissional_id: p.professional_id,
      medico_nome: p.professionals?.nome || 'Profissional',
      detalhes: p.detalhes,
      data_criacao: p.data
    }))
  },

  async getPrescricaoById(id: string) {
    const supabase = await createClient()

    // @ts-ignore
    const { data, error } = await supabase
      .from('prescricoes')
      .select(`
        *,
        patients ( nome, cpf, data_nasc ),
        professionals ( nome, crm_coren, especializacao )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar prescrição individual:', error)
      return null
    }

    return data as any
  },

  async createPrescricao(data: {
    pacienteId: string
    medicamentos: any[]
    observacoes?: string
    cid10?: string
  }) {
    const supabase = await createClient()

    // Obter o profissional logado
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) throw new Error('Usuário não autenticado')

    const { data: professional } = await supabase
      .from('professionals')
      .select('id, nome, crm_coren')
      .eq('user_id', authData.user.id)
      .single()

    if (!professional) throw new Error('Profissional não encontrado')

    // @ts-ignore
    const { data: prescricao, error } = await supabase
      .from('prescricoes')
      // @ts-ignore
      .insert({
        patient_id: data.pacienteId,
        professional_id: (professional as any).id,
        detalhes: {
          medicamentos: data.medicamentos,
          observacoes: data.observacoes,
          cid10: data.cid10
        },
        data: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar prescrição: ${error.message}`)
    }

    return (prescricao as any)
  }
}
