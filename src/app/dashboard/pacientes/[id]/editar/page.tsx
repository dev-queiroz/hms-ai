'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { FormError } from '@/components/common/FormError'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { updatePacienteAction } from '@/actions/paciente-update'
import { masks } from '@/lib/utils/masks'

interface EditPacientePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default function EditarPacientePage({ params }: EditPacientePageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await updatePacienteAction(resolvedParams.id, null, formData)

    if (result.error) {
      setError(result.error)
      toast.error('Erro ao salvar', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success('Paciente atualizado!', { description: 'Os dados foram salvos com sucesso.' })
      router.push(`/dashboard/pacientes/${resolvedParams.id}`)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-slate-200">
          <Link href={`/dashboard/pacientes/${resolvedParams.id}`}>
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Editar Paciente</h1>
            <p className="text-slate-400 text-sm">Atualize os dados cadastrais.</p>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-slate-200">Dados Cadastrais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nome" className="text-slate-300">Nome Completo *</Label>
                <Input name="nome" id="nome" required className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="Nome do paciente" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-slate-300">CPF *</Label>
                <Input name="cpf" id="cpf" required className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="000.000.000-00" onChange={(e) => e.target.value = masks.cpf(e.target.value)} defaultValue={undefined /* will need default values later if populated, but keep uncontrolled */} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg" className="text-slate-300">RG</Label>
                <Input name="rg" id="rg" className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="Documento RG" onChange={(e) => e.target.value = masks.rg(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sus_number" className="text-slate-300">Cartão SUS *</Label>
                <Input name="sus_number" id="sus_number" required className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="000 0000 0000 0000" onChange={(e) => e.target.value = masks.sus(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_nasc" className="text-slate-300">Data de Nascimento *</Label>
                <Input name="data_nasc" id="data_nasc" type="date" required className="bg-slate-800/50 border-slate-700 text-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contato" className="text-slate-300">Contato *</Label>
                <Input name="contato" id="contato" required className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="(00) 00000-0000" onChange={(e) => e.target.value = masks.telefone(e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="endereco" className="text-slate-300">Endereço *</Label>
                <Input name="endereco" id="endereco" required className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="Rua, Número, Bairro - Cidade/UF" />
              </div>
            </div>

            <FormError message={error || undefined} />

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]" disabled={loading}>
                {loading ? <LoadingSpinner className="text-white" /> : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
