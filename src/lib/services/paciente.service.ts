import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/supabase'

type PacienteInsert = Database['public']['Tables']['patients']['Insert']
type PacienteRow = Database['public']['Tables']['patients']['Row']

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
    return { data: data || [], count: count || 0 }
  },
  
  async getPacienteById(id: string): Promise<PacienteRow | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar paciente:', error)
      return null
    }
    return data
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
      // @ts-ignore
      .insert([data])
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
      // @ts-ignore
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar paciente:', error)
      throw new Error(error.message)
    }
    return updatedPaciente
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

  async getProntuarioByPatientId(patientId: string): Promise<Database['public']['Tables']['prontuarios']['Row'] | null> {
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
    // @ts-ignore - bypassing strict generic check
    return data
  },

  async getTriagensByPatientId(patientId: string): Promise<Database['public']['Tables']['triagens']['Row'][]> {
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
    // @ts-ignore
    return data || []
  }
}
