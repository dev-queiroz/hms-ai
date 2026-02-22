import { createClient } from '../supabase/server'

export type UnidadeSaudeSummary = {
  id: string
  nome: string
  tipo: string
  endereco: string
  contato: string
  responsavel_id: string | null
  responsavel_nome: string | null
  created_at: string
}

export const unidadeService = {
  async getUnidades(): Promise<UnidadeSaudeSummary[]> {
    const { createClient: createSupabaseClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )

    // @ts-ignore
    const { data: unidades, error } = await supabaseAdmin
      .from('unidades_saude')
      .select(`
        id,
        nome,
        tipo,
        endereco,
        contato,
        responsavel_id,
        created_at,
        professionals!responsavel_id (
          nome
        )
      `)
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar unidades de saúde:', error)
      return []
    }

    return (unidades || []).map((u: any) => ({
      id: u.id,
      nome: u.nome,
      tipo: u.tipo || 'Não Definido',
      endereco: u.endereco || '—',
      contato: u.contato || '—',
      responsavel_id: u.responsavel_id,
      responsavel_nome: u.professionals?.nome || 'Não Atribuído',
      created_at: u.created_at
    }))
  },

  async getUnidadeById(id: string) {
    const supabase = await createClient()

    // @ts-ignore
    const { data, error } = await supabase
      .from('unidades_saude')
      .select(`
        *,
        professionals!responsavel_id (
          nome,
          crm_coren
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar unidade de saúde:', error)
      return null
    }

    return data as any
  }
}
