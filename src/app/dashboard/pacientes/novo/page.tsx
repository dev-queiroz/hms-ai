'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FormError } from '@/components/common/FormError'
import { createPacienteAction } from '@/actions/paciente'
import { masks } from '@/lib/utils/masks'

export default function NovoPacientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createPacienteAction(null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error('Erro no cadastro', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success('Sucesso!', { description: 'Paciente cadastrado com sucesso.' })
      router.push('/dashboard/pacientes')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Novo Paciente</h1>
        <p className="text-slate-400">Cadastre as informações básicas do paciente para abrir um prontuário.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Dados Pessoais</CardTitle>
          <CardDescription className="text-slate-400">Preencha os dados com atenção.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-300">Nome Completo</Label>
              <Input name="nome" id="nome" required className="bg-slate-800/50 border-slate-700 text-slate-200" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-slate-300">CPF</Label>
                <Input name="cpf" id="cpf" required placeholder="000.000.000-00" className="bg-slate-800/50 border-slate-700 text-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg" className="text-slate-300">RG (Opcional)</Label>
                <Input name="rg" id="rg" className="bg-slate-800/50 border-slate-700 text-slate-200" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sus_number" className="text-slate-300">Cartão do SUS</Label>
                <Input name="sus_number" id="sus_number" required className="bg-slate-800/50 border-slate-700 text-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_nasc" className="text-slate-300">Data de Nascimento</Label>
                <Input type="date" name="data_nasc" id="data_nasc" required className="bg-slate-800/50 border-slate-700 text-slate-200 [color-scheme:dark]" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco" className="text-slate-300">Endereço Completo</Label>
              <Input name="endereco" id="endereco" required className="bg-slate-800/50 border-slate-700 text-slate-200" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato" className="text-slate-300">Telefone / Contato</Label>
              <Input name="contato" id="contato" required className="bg-slate-800/50 border-slate-700 text-slate-200" />
            </div>

            <FormError message={error || undefined} />

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={loading}>
                {loading ? <LoadingSpinner className="text-white" /> : 'Salvar Paciente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
