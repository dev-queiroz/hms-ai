import { createClient } from '@/lib/supabase/server'

export const professionalsService = {
  async getProfessionals(unidadeSaudeId?: string) {
    // Usando Service Key para bypass de RLS temporário
    const { createClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    let query = supabaseAdmin
      .from('professionals')
      .select('*')
    
    if (unidadeSaudeId) {
      query = query.eq('unidade_saude_id', unidadeSaudeId)
    }

    const { data, error } = await query.order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar profissionais:', error)
      return []
    }
    return data || []
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
  }
}
