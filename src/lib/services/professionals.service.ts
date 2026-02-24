import { createClient } from '@/lib/supabase/server'
import { Database } from '../types/supabase'

type ProfessionalRow = Database['public']['Tables']['professionals']['Row']
type ProfessionalUpdate = Database['public']['Tables']['professionals']['Update']

export const professionalsService = {
  async getProfessionals(unidadeSaudeId?: string, page: number = 1, limit: number = 20): Promise<{ data: ProfessionalRow[], count: number }> {
    const supabase = await createClient()

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('professionals')
      .select('*', { count: 'exact' })
    
    if (unidadeSaudeId) {
      query = query.eq('unidade_saude_id',  unidadeSaudeId)
    }

    const { data, error, count } = await query
      .order('nome', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('Erro ao buscar profissionais:', error)
      return { data: [], count: 0 }
    }
    return { data: (data as ProfessionalRow[]) || [], count: count || 0 }
  },

  async getLoggedProfessionalInfo(userId: string): Promise<Pick<ProfessionalRow, 'nome' | 'cargo' | 'role' | 'unidade_saude_id'> | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('professionals')
      .select('nome, cargo, role, unidade_saude_id')
      .eq('user_id', userId)
      .single()

    if (error) {
       console.error('Erro getLoggedProfessionalInfo:', error)
       return null
    }
    return data as any
  },

  async getProfessionalById(id: string): Promise<ProfessionalRow | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro getProfessionalById:', error)
      return null
    }
    return data as ProfessionalRow
  },

  async updateProfessional(id: string, data: ProfessionalUpdate): Promise<ProfessionalRow> {
    const supabase = await createClient()
    const { data: updated, error } = await (supabase
      .from('professionals') as any)
      .update(data as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro updateProfessional:', error)
      throw new Error(error.message)
    }
    return updated as ProfessionalRow
  },

  async createProfessional(data: Omit<ProfessionalRow, 'id' | 'created_at' | 'updated_at'>): Promise<ProfessionalRow> {
    const supabase = await createClient()
    const { data: created, error } = await (supabase
      .from('professionals') as any)
      .insert([data] as any)
      .select()
      .single()

    if (error) {
      console.error('Erro createProfessional:', error)
      throw new Error(error.message)
    }
    return created as ProfessionalRow
  },

  async deleteProfessional(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await (supabase
      .from('professionals') as any)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro deleteProfessional:', error)
      throw new Error(error.message)
    }
  }
}
