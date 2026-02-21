import Groq from 'groq-sdk'

// A chave será instanciada apenas do lado do servidor
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'fake_key_for_build' })

export const iaService = {
  async preverSurtos(dadosRegionais: string) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY não configurada no servidor.")
    }

    const prompt = `Você é uma IA biomédica especializada em saúde pública epidemiológica.
    Analise os seguintes dados regionais de triagens recentes de um hospital:
    ${dadosRegionais}
    
    Com base nesses dados:
    1. Identifique se existe a potencial formação de um surto contagioso.
    2. Escreva uma breve explicação do porquê.
    3. Determine o nível de risco (ALTO, MEDIO, BAIXO).
    
    Responda EXATAMENTE no seguinte formato JSON, sem Markdown em volta:
    {
      "risco": "ALTO/MEDIO/BAIXO",
      "motivo": "Sua explicação condensada em até 3 frases."
    }`

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    })
    
    const content = chatCompletion.choices[0]?.message?.content
    if (!content) throw new Error("A IA não retornou um conteúdo válido.")
    
    return JSON.parse(content)
  },

  async gerarRelatorioPaciente(historico: string) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY não configurada no servidor.")
    }

    const prompt = `Você é um médico assistente IA do Hospital IA.
    Crie um relatório clínico conciso resumindo o estado do paciente com base no seguinte histórico:
    ${historico}
    
    Mantenha a linguagem estritamente profissional e comente quais áreas merecem observação. Máximo de 2 parágrafos curtos.`

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    })
    
    return { relatorio: chatCompletion.choices[0]?.message?.content }
  }
}
