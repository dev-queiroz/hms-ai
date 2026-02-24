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
import { updateProfessionalAction } from '@/actions/professionals'
import { User, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface ProfessionalFormProps {
  professional: any
  unidades: any[]
}

export function ProfessionalForm({ professional, unidades }: ProfessionalFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateProfessionalAction(professional.id, null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error('Erro ao atualizar', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success('Profissional atualizado!', { description: 'Os dados da equipe foram salvos.' })
      router.push('/dashboard/professionals')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-slate-200">
          <Link href="/dashboard/professionals">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                <User className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-100 uppercase">Editar Profissional</h1>
                <p className="text-slate-400">Gerencie permissões e vínculos de {professional.nome}.</p>
            </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-slate-200">Dados Profissionais</CardTitle>
          <CardDescription className="text-slate-400">Atualize o cargo, especialização e unidade de saúde.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-300">Nome Completo *</Label>
              <Input name="nome" id="nome" required defaultValue={professional.nome} className="bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-indigo-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargo" className="text-slate-300">Cargo</Label>
                <Input name="cargo" id="cargo" defaultValue={professional.cargo || ''} className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="Ex: Médico Plantonista" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">Tipo de Acesso (Role) *</Label>
                <select 
                  name="role" 
                  id="role" 
                  defaultValue={professional.role}
                  className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-200"
                >
                  <option value="professional" className="bg-slate-900">Profissional</option>
                  <option value="admin" className="bg-slate-900">Administrador</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="especializacao" className="text-slate-300">Especialização</Label>
              <Input name="especializacao" id="especializacao" defaultValue={professional.especializacao || ''} className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="Ex: Cardiologia" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidade_saude_id" className="text-slate-300">Unidade de Saúde Atribuída</Label>
              <select 
                name="unidade_saude_id" 
                id="unidade_saude_id" 
                defaultValue={professional.unidade_saude_id || ''}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-200"
              >
                <option value="" className="bg-slate-900">— Nenhuma atribuída —</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.id} className="bg-slate-900">{u.nome}</option>
                ))}
              </select>
            </div>

            <FormError message={error || undefined} />

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px] shadow-lg shadow-indigo-900/20" disabled={loading}>
                {loading ? <LoadingSpinner className="text-white" /> : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
