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
import { createPacienteAction, updatePacienteAction } from '@/actions/paciente'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface PacienteFormProps {
  paciente?: any
}

export function PacienteForm({ paciente }: PacienteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = !!paciente?.id

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = isEdit 
      ? await updatePacienteAction(paciente.id, null, formData)
      : await createPacienteAction(null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error(isEdit ? 'Erro na atualização' : 'Erro no cadastro', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success(isEdit ? 'Paciente atualizado!' : 'Paciente cadastrado!', { 
        description: isEdit ? 'Os dados foram salvos com sucesso.' : 'O paciente foi adicionado ao sistema.' 
      })
      router.push('/dashboard/pacientes')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-slate-200">
          <Link href={isEdit ? `/dashboard/pacientes/${paciente.id}` : "/dashboard/pacientes"}>
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">{isEdit ? 'Editar Paciente' : 'Novo Paciente'}</h1>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-slate-200 font-semibold">{isEdit ? 'Dados Cadastrais' : 'Informações Básicas'}</CardTitle>
          <CardDescription className="text-slate-400">
            {isEdit ? `Atualize as informações de ${paciente.nome}.` : 'Preencha os dados para abrir o prontuário do paciente.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-300">Nome Completo *</Label>
              <Input 
                name="nome" id="nome" required 
                defaultValue={paciente?.nome || ''}
                className="bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-teal-500" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-slate-300">CPF *</Label>
                <Input 
                  name="cpf" id="cpf" required placeholder="000.000.000-00" 
                  defaultValue={paciente?.cpf || ''}
                  className="bg-slate-800/50 border-slate-700 text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg" className="text-slate-300">RG (Opcional)</Label>
                <Input 
                  name="rg" id="rg" 
                  defaultValue={paciente?.rg || ''}
                  className="bg-slate-800/50 border-slate-700 text-slate-200" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sus_number" className="text-slate-300">Cartão do SUS *</Label>
                <Input 
                  name="sus_number" id="sus_number" required 
                  defaultValue={paciente?.sus_number || ''}
                  className="bg-slate-800/50 border-slate-700 text-slate-200" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_nasc" className="text-slate-300">Data de Nascimento *</Label>
                <Input 
                  type="date" name="data_nasc" id="data_nasc" required 
                  defaultValue={paciente?.data_nasc ? new Date(paciente.data_nasc).toISOString().split('T')[0] : ''}
                  className="bg-slate-800/50 border-slate-700 text-slate-200 [color-scheme:dark]" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco" className="text-slate-300">Endereço Completo</Label>
              <Input 
                name="endereco" id="endereco" required 
                defaultValue={paciente?.endereco || ''}
                className="bg-slate-800/50 border-slate-700 text-slate-200" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato" className="text-slate-300">Telefone / Contato</Label>
              <Input 
                name="contato" id="contato" required 
                defaultValue={paciente?.contato || ''}
                className="bg-slate-800/50 border-slate-700 text-slate-200" 
              />
            </div>

            <FormError message={error || undefined} />

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <Button type="button" variant="ghost" className="text-slate-400 hover:text-slate-200" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white min-w-[150px]" disabled={loading}>
                {loading ? <LoadingSpinner className="text-white mr-2" /> : isEdit ? 'Salvar Alterações' : 'Cadastrar Paciente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
