'use server'

import { iaService } from '@/lib/services/ia.service'

export type PredictOutbreakState = {
  error?: string
  data?: {
    risco: string
    motivo: string
  }
}

export async function preverSurtoAction(
  prevState: PredictOutbreakState | null,
  formData: FormData
): Promise<PredictOutbreakState> {
  try {
    const contextText = formData.get('contextText') as string
    if (!contextText) {
      return { error: 'O contexto regional não foi informado.' }
    }
    
    const result = await iaService.preverSurtos(contextText)
    return { data: result }
  } catch (error: any) {
    console.error('Erro na preverSurtoAction:', error)
    return { error: error.message || 'Falha ao processar previsão de surtos via Groq.' }
  }
}
