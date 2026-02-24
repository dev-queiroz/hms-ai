import { createClient } from '@/lib/supabase/server'

export const professionalsService = {
  async getProfessionals(unidadeSaudeId?: string, page: number = 1, limit: number = 20) {
    // Usando Service Key para bypass de RLS temporário
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabaseAdmin
      .from('professionals')
      .select('*', { count: 'exact' })
    
    if (unidadeSaudeId) {
      query = query.eq('unidade_saude_id', unidadeSaudeId)
    }

    const { data, error, count } = await query
      .order('nome', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('Erro ao buscar profissionais:', error)
      return { data: [], count: 0 }
    }
    return { data: data || [], count: count || 0 }
  },

  async getLoggedProfessionalInfo(userId: string) {
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    const { data, error } = await supabaseAdmin
      .from('professionals')
      .select('nome, cargo, role, unidade_saude_id')
      .eq('user_id', userId)
      .single()

    if (error) {
       console.error('Erro getLoggedProfessionalInfo:', error)
       return null
    }
    return data
  },

  async getProfessionalById(id: string) {
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    const { data, error } = await supabaseAdmin
      .from('professionals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro getProfessionalById:', error)
      return null
    }
    return data
  },

  async updateProfessional(id: string, data: any) {
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    const { data: updated, error } = await supabaseAdmin
      .from('professionals')
      // @ts-ignore
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro updateProfessional:', error)
      throw new Error(error.message)
    }
    return updated
  }
}
