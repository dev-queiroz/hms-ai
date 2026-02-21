'use server'

import { iaService } from '@/lib/services/ia.service'
import { pacienteService } from '@/lib/services/paciente.service'
import { createClient } from '@/lib/supabase/server'

export async function gerarResumoPacienteAction(patientId: string) {
  try {
    const paciente = await pacienteService.getPacienteById(patientId)
    if (!paciente) throw new Error('Paciente não encontrado')

    const prontuario = await pacienteService.getProntuarioByPatientId(patientId)
    const triagens = await pacienteService.getTriagensByPatientId(patientId)

    // Consolidar histórico para a IA
    const historyRaw = prontuario?.history
    const notas = Array.isArray(historyRaw) ? historyRaw : (historyRaw ? [historyRaw] : [])
    
    const historicoTexto = `
      PACIENTE: ${paciente.nome} (SUS: ${paciente.sus_number})
      
      TRIAGENS:
      ${triagens.map(t => `- [${t.data_hora}] Risco: ${t.classificacao_risco}. Sintomas: ${t.sintomas}`).join('\n')}
      
      NOTAS CLÍNICAS:
      ${notas.map((n: any) => `- [${n.data}] ${n.profissional}: ${n.descricao}`).join('\n')}
    `

    const { relatorio } = await iaService.gerarRelatorioPaciente(historicoTexto)
    
    return { relatorio }
  } catch (error: any) {
    console.error('Erro gerarResumoPacienteAction:', error)
    return { error: error.message || 'Erro ao gerar resumo pela IA.' }
  }
}

export async function preverSurtoAction(
  prevState: any,
  formData: FormData
) {
  try {
    const contextText = formData.get('contextText') as string
    const supabase = await createClient()
    
    // Pegar triagens das últimas 48h para análise epidemiológica
    const ha48Horas = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    
    const { data: triagens } = await supabase
      .from('triagens')
      .select('sintomas, classificacao_risco, data_hora')
      .gte('data_hora', ha48Horas)

    if (!triagens || triagens.length === 0) {
      return { 
        data: {
          risco: 'BAIXO', 
          motivo: 'Volume de triagens insuficiente nas últimas 48h para análise de padrões de surto.' 
        }
      }
    }

    const triagensTexto = triagens.map((t: any) => 
      `[${t.data_hora}] Risco: ${t.classificacao_risco}. Sintomas: ${t.sintomas}`
    ).join('\n')

    const prompt = `
      CONTEXTO ADICIONAL DO PROFISSIONAL: ${contextText || 'Nenhum'}
      
      TRIAGENS RECENTES (48h):
      ${triagensTexto}
    `

    const resultado = await iaService.preverSurtos(prompt)
    return { data: resultado }
  } catch (error: any) {
    console.error('Erro preverSurtoAction:', error)
    return { error: error.message || 'Erro ao processar análise epidemiológica.' }
  }
}


