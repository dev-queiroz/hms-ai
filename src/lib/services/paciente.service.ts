import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/supabase'

type PacienteInsert = Database['public']['Tables']['patients']['Insert']
type PacienteRow = Database['public']['Tables']['patients']['Row']
type TriagemInsert = Database['public']['Tables']['triagens']['Insert']
type TriagemRow = Database['public']['Tables']['triagens']['Row']
type ProntuarioRow = Database['public']['Tables']['prontuarios']['Row']

export const pacienteService = {
  async getPacientes(page: number = 1, limit: number = 10, search?: string): Promise<{ data: PacienteRow[], count: number }> {
    const supabase = await createClient()
    
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('data_nasc', { ascending: false })

    if (search) {
      query = query.or(`nome.ilike.%${search}%,cpf.ilike.%${search}%`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error('Erro ao buscar pacientes:', error)
      return { data: [], count: 0 }
    }
    return { data: (data as PacienteRow[]) || [], count: count || 0 }
  },
  
  async getPacienteById(id: string): Promise<PacienteRow | null> {
    const supabase = await createClient()
    
    // Tenta primeiro a view decriptada (padrao pg_sodium do Supabase)
    try {
      const { data: viewData, error: viewError } = await supabase
        .from('decrypted_patients' as any)
        .select('*')
        .eq('id', id)
        .single()

      if (!viewError && viewData) {
        return viewData as any
      }
    } catch (e) {
      console.warn('View decrypted_patients não encontrada, usando tabela padrão.')
    }

    // Fallback para a tabela patients
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar paciente:', error)
      return null
    }

    return data as any
  },

  async createPaciente(data: Partial<PacienteInsert>) {
    const supabase = await createClient()
    
    // Obter usuário logado para vinculação (necessário para políticas RLS)
    const { data: authData } = await supabase.auth.getUser()
    if (authData.user) {
      data.user_id = authData.user.id
    }

    const { data: newPaciente, error } = await supabase
      .from('patients')
      .insert(data as PacienteInsert)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar paciente:', error)
      throw new Error(error.message)
    }
    return newPaciente as PacienteRow
  },

  async updatePaciente(id: string, data: Partial<PacienteInsert>) {
    const supabase = await createClient()
    const { data: updatedPaciente, error } = await supabase
      .from('patients')
      .update(data as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar paciente:', error)
      throw new Error(error.message)
    }
    return updatedPaciente as PacienteRow
  },

  async deletePaciente(id: string) {
    const supabase = await createClient()
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar paciente:', error)
      throw new Error(error.message)
    }
    return true
  },

  async getProntuarioByPatientId(patientId: string): Promise<ProntuarioRow | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('prontuarios')
      .select('*')
      .eq('patient_id', patientId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = zero rows
      console.error('Erro ao buscar prontuário:', error)
      return null
    }
    return data as ProntuarioRow
  },

  async getTriagensByPatientId(patientId: string): Promise<TriagemRow[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('triagens')
      .select('*')
      .eq('patient_id', patientId)
      .order('data_hora', { ascending: false })

    if (error) {
      console.error('Erro ao buscar triagens:', error)
      return []
    }
    return (data as TriagemRow[]) || []
  },

  async createTriagem(data: any) {
    const supabase = await createClient()
    // Support both naming conventions from different callers
    const patientId = data.patient_id || data.pacienteId
    const professionalId = data.professional_id || data.professionalId

    const { data: newTriagem, error } = await (supabase
      .from('triagens') as any)
      .insert({
        patient_id: patientId,
        professional_id: professionalId,
        sinais_vitais: data.sinais_vitais,
        sintomas: data.sintomas,
        classificacao_risco: data.classificacao_risco,
        data_hora: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar triagem: ${error.message}`)
    }

    return newTriagem
  },

  async getAllTriagens(page: number = 1, limit: number = 20): Promise<{ data: any[], count: number }> {
    const supabase = await createClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('triagens')
      .select('*, patients(nome, cpf)', { count: 'exact' })
      .order('data_hora', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('Erro ao buscar todas as triagens:', error)
      return { data: [], count: 0 }
    }
    return { data: data || [], count: count || 0 }
  }
}
