/**
 * Serviço de Integração com a Inteligência Artificial (Groq)
 */

import Groq from 'groq-sdk'

// A chave será instanciada apenas do lado do servidor
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'fake_key_for_build' })

export const iaService = {
  async preverSurtos(dadosRegionais: any) {
    // Placeholder para chamada à LLM
    /*
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: 'Você é um modelo preditivo de saúde pública...' }],
      model: 'mixtral-8x7b-32768',
    })
    return chatCompletion.choices[0]?.message?.content
    */
    return { status: 'mock', insight: 'Nenhum surto projetado' }
  },

  async gerarRelatorioPaciente(historico: any) {
    return { status: 'mock', relatorio: 'Paciente estabilizado.' }
  }
}
