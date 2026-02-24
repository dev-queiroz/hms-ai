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
  async getUnidades(page: number = 1, limit: number = 20): Promise<{ data: UnidadeSaudeSummary[], count: number }> {
    const supabase = await createClient()

    const from = (page - 1) * limit
    const to = from + limit - 1

    // @ts-ignore
    const { data: unidades, error, count } = await supabase
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
      `, { count: 'exact' })
      .order('nome', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('Erro ao buscar unidades de saúde:', error)
      return { data: [], count: 0 }
    }

    const data = (unidades || []).map((u: any) => ({
      id: u.id,
      nome: u.nome,
      tipo: u.tipo || 'Não Definido',
      endereco: u.endereco || '—',
      contato: u.contato || '—',
      responsavel_id: u.responsavel_id,
      responsavel_nome: u.professionals?.nome || 'Não Atribuído',
      created_at: u.created_at
    }))

    return { data, count: count || 0 }
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

    return data as any
  },

  async createUnidade(data: any) {
    const supabase = await createClient()
    const { data: newUnidade, error } = await supabase
      .from('unidades_saude')
      // @ts-ignore
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar unidade de saúde:', error)
      throw new Error(error.message)
    }
    return newUnidade
  },

  async updateUnidade(id: string, data: any) {
    const supabase = await createClient()
    const { data: updatedUnidade, error } = await supabase
      .from('unidades_saude')
      // @ts-ignore
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar unidade de saúde:', error)
      throw new Error(error.message)
    }
    return updatedUnidade
  }
}
