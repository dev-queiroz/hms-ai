'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, Brain, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { preverSurtoAction } from '@/actions/ia'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FormError } from '@/components/common/FormError'

export default function IADashboardPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ risco: string; motivo: string } | null>(null)

  const handlePredict = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData(e.currentTarget)
    const response = await preverSurtoAction(null, formData)

    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setResult(response.data)
    }
    
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Inteligência Artificial</h1>
        <p className="text-slate-400">Análises preditivas e insights hospitalares gerados pela Groq.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-teal-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Previsão de Surtos Regionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-400">
              Descreva o contexto atual (ex: região, aumento de queixas respiratórias nos últimos dias, clima) para que o modelo Mixtral avalie o risco de epidemia.
            </p>
            
            <form onSubmit={handlePredict} className="space-y-4">
              <textarea 
                name="contextText"
                rows={4}
                required
                placeholder="Ex: Aumento súbito de 40% em triagens com febre alta e dores articulares no bairro Centro nos últimos 3 dias chuvosos."
                className="flex w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-200"
              />
              
              <FormError message={error || undefined} />
              
              <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                {loading ? <LoadingSpinner className="text-white mr-2" /> : null}
                {loading ? 'Analisando dados...' : 'Executar Previsão'}
              </Button>
            </form>

            {result && (
              <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${
                    result.risco === 'ALTO' ? 'text-rose-500' : 
                    result.risco === 'MEDIO' ? 'text-amber-500' : 'text-emerald-500'
                  }`} />
                  <h3 className="font-semibold text-slate-200">
                    Risco Identificado: <span className={`${
                      result.risco === 'ALTO' ? 'text-rose-400' : 
                      result.risco === 'MEDIO' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>{result.risco}</span>
                  </h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {result.motivo}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Placeholder para a próxima feature */}
        <Card className="bg-slate-900 border-slate-800 opacity-70">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Análise de Prontuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm">
              Esta ferramenta avalia automaticamente o histórico médico do paciente selecionado para sugerir diagnósticos ocultos. (Integração na página de perfil do paciente em breve).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
