'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FormError } from '@/components/common/FormError'
import { createNotaAcao } from '@/actions/prontuario'

export default function NovaNotaProntuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('pacienteId', resolvedParams.id)

    const result = await createNotaAcao(null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error('Erro na evolução', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success('Nota salva!', { description: 'A evolução clínica foi adicionada ao prontuário.' })
      router.push(`/dashboard/pacientes/${resolvedParams.id}`)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Nova Evolução</h1>
        <p className="text-slate-400">Descreva a evolução clínica ou anotação para o prontuário deste paciente.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Nota Médica / Evolução de Enfermagem</CardTitle>
          <CardDescription className="text-slate-400">Esta nota ficará gravada definitivamente no histórico do paciente.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-slate-300">Resumo Clínico / Prescrição Atual</Label>
              <textarea 
                name="descricao" 
                id="descricao"
                required
                rows={10}
                className="flex w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-200"
                placeholder="Paciente apresenta quadro estável, pressão arterial..."
              />
            </div>

            <FormError message={error || undefined} />

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
                {loading ? <LoadingSpinner className="text-white" /> : 'Anexar ao Prontuário'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
