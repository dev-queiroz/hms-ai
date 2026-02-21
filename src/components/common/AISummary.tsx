'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { gerarResumoPacienteAction } from '@/actions/ia'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AISummaryProps {
  patientId: string
}

export function AISummary({ patientId }: AISummaryProps) {
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    const result = await gerarResumoPacienteAction(patientId)
    setLoading(false)

    if (result.error) {
      toast.error('Erro na IA', { description: result.error })
    } else if (result.relatorio) {
      setSummary(result.relatorio)
      toast.success('Resumo gerado!', { description: 'A análise clínica do Llama 3.3 está pronta.' })
    }
  }

  if (summary) {
    return (
      <Card className="bg-teal-950/20 border-teal-500/30 animate-in fade-in slide-in-from-top-4 duration-500">
        <CardHeader className="pb-2 border-b border-teal-500/20">
          <CardTitle className="text-xs font-bold text-teal-400 flex items-center gap-2 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Parecer Técnico IA
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <p className="text-sm text-slate-200 leading-relaxed italic">
            "{summary}"
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSummary(null)}
            className="mt-3 text-[10px] text-teal-500 hover:text-teal-400 p-0 h-auto"
          >
            Refazer análise
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Button 
      onClick={handleGenerate}
      disabled={loading}
      className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-lg shadow-teal-900/20"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Analisando...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          Resumo IA
        </>
      )}
    </Button>
  )
}
