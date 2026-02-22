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

  return (
    <>
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

      {summary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-900 border-teal-500/50 shadow-2xl animate-in zoom-in-95 duration-300 custom-scrollbar relative">
            <CardHeader className="pb-3 border-b border-slate-800 sticky text-left top-0 bg-slate-900/95 backdrop-blur z-10 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-teal-400 flex items-center gap-2 uppercase tracking-widest m-0">
                <Sparkles className="w-4 h-4" /> Parecer Técnico IA - Llama 3.3
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSummary(null)} 
                className="text-slate-400 hover:text-white h-8"
              >
                Fechar
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-invert prose-teal max-w-none text-sm text-slate-300 mb-6">
                 <p className="whitespace-pre-wrap leading-relaxed">{summary}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setSummary(null); handleGenerate(); }}
                className="text-teal-500 hover:text-teal-400 border-slate-700"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Refazer análise
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
