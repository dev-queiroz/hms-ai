'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FormError } from '@/components/common/FormError'
import { createTriagemAction } from '@/actions/triagem'
import { Activity } from 'lucide-react'
import { masks } from '@/lib/utils/masks'

export default function NovaTriagemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [risco, setRisco] = useState('Verde')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('patientId', resolvedParams.id)
    formData.append('classificacao_risco', risco)

    const result = await createTriagemAction(null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error('Erro na triagem', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success('Triagem registrada!', { description: 'Os dados vitais foram anexados ao prontuário.' })
      router.push(`/dashboard/pacientes/${resolvedParams.id}`)
    }
  }

  const riscos = [
    { nome: 'Vermelho', cor: 'bg-red-500', text: 'Emergência' },
    { nome: 'Laranja', cor: 'bg-orange-500', text: 'Muito Urgente' },
    { nome: 'Amarelo', cor: 'bg-yellow-500', text: 'Urgente' },
    { nome: 'Verde', cor: 'bg-green-500', text: 'Pouco Urgente' },
    { nome: 'Azul', cor: 'bg-blue-500', text: 'Não Urgente' },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-teal-500/20 rounded-lg text-teal-500">
            <Activity className="w-6 h-6" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">Nova Triagem</h1>
            <p className="text-slate-400">Coleta de sinais vitais e classificação de risco.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-slate-200">Sinais Vitais & Queixa Principal</CardTitle>
          <CardDescription className="text-slate-400">Preencha os indicadores clínicos coletados durante a triagem inicial.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <Label className="text-slate-300">Classificação de Risco (Protocolo Manchester)</Label>
              <div className="flex flex-wrap gap-3 pt-2">
                {riscos.map((r) => (
                  <button
                    key={r.nome}
                    type="button"
                    onClick={() => setRisco(r.nome)}
                    className={`flex-1 min-w-[120px] p-3 rounded-lg border-2 transition-all text-center ${
                      risco === r.nome 
                        ? `${r.cor} border-white text-white font-bold scale-105 shadow-lg` 
                        : 'bg-slate-800 border-slate-700 text-slate-400 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="text-xs uppercase opacity-80 mb-1">{r.nome}</div>
                    <div className="text-sm">{r.text}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sintomas" className="text-slate-300">Sintomas / Queixa Principal *</Label>
                <textarea 
                  name="sintomas" 
                  id="sintomas" 
                  required 
                  className="flex w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 min-h-[100px]"
                  placeholder="Ex: Dor de cabeça intensa há 2 dias, febre de 38.5..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes" className="text-slate-300">Observações Adicionais</Label>
                <textarea 
                  name="observacoes" 
                  id="observacoes" 
                  className="flex w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 min-h-[100px]"
                  placeholder="Ex: Histórico de alergia a dipirona..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pressao_arterial" className="text-slate-400 text-[11px] uppercase font-bold">Pressão (PA)</Label>
                <Input name="pressao_arterial" id="pressao_arterial" placeholder="120/80" className="bg-slate-800/50 border-slate-700 text-slate-200" onChange={(e) => e.target.value = masks.pressao(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperatura" className="text-slate-400 text-[11px] uppercase font-bold">Temp (ºC)</Label>
                <Input name="temperatura" id="temperatura" type="number" step="0.1" placeholder="36.5" className="bg-slate-800/50 border-slate-700 text-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequencia_cardiaca" className="text-slate-400 text-[11px] uppercase font-bold">Batimentos (bpm)</Label>
                <Input name="frequencia_cardiaca" id="frequencia_cardiaca" type="number" placeholder="80" className="bg-slate-800/50 border-slate-700 text-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saturacao_oxigenio" className="text-slate-400 text-[11px] uppercase font-bold">SpO2 (%)</Label>
                <Input name="saturacao_oxigenio" id="saturacao_oxigenio" type="number" placeholder="98" className="bg-slate-800/50 border-slate-700 text-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivel_dor" className="text-slate-400 text-[11px] uppercase font-bold">Escala Dor (0-10)</Label>
                <Input name="nivel_dor" id="nivel_dor" type="number" min="0" max="10" placeholder="0" className="bg-slate-800/50 border-slate-700 text-slate-200" />
              </div>
            </div>

            <FormError message={error || undefined} />

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white min-w-[150px]" disabled={loading}>
                {loading ? <LoadingSpinner className="text-white" /> : 'Registrar Triagem'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
