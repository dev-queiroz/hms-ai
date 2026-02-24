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
import { updateUnidadeAction } from '@/actions/unidade'
import { Building2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface UnidadeFormProps {
  unidade: any
  professionals: any[]
}

export function UnidadeForm({ unidade, professionals }: UnidadeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateUnidadeAction(unidade.id, null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error('Erro ao atualizar', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success('Unidade atualizada!', { description: 'Os dados foram salvos com sucesso.' })
      router.push(`/dashboard/unidades/${unidade.id}`)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-sans">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-slate-200">
          <Link href={`/dashboard/unidades/${unidade.id}`}>
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg text-teal-500">
                <Building2 className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-100 uppercase">Editar Unidade</h1>
                <p className="text-slate-400">Atualize as informações de {unidade.nome}.</p>
            </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-slate-200">Informações Gerais</CardTitle>
          <CardDescription className="text-slate-400">Dados de localização e gestão da unidade.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-300">Nome da Unidade *</Label>
              <Input name="nome" id="nome" required defaultValue={unidade.nome} className="bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-teal-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-slate-300">Tipo de Unidade *</Label>
              <Input name="tipo" id="tipo" required defaultValue={unidade.tipo} className="bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-teal-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco" className="text-slate-300">Endereço Completo *</Label>
              <Input name="endereco" id="endereco" required defaultValue={unidade.endereco} className="bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-teal-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato" className="text-slate-300">Telefone / E-mail de Contato *</Label>
              <Input name="contato" id="contato" required defaultValue={unidade.contato} className="bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-teal-500" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel_id" className="text-slate-300">Responsável Técnico</Label>
              <select 
                name="responsavel_id" 
                id="responsavel_id" 
                defaultValue={unidade.responsavel_id || ''}
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 text-slate-200"
              >
                <option value="" className="bg-slate-900">— Selecione um responsável —</option>
                {professionals.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900">{p.nome} ({p.cargo || p.role})</option>
                ))}
              </select>
            </div>

            <FormError message={error || undefined} />

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white min-w-[150px] shadow-lg shadow-teal-900/20" disabled={loading}>
                {loading ? <LoadingSpinner className="text-white" /> : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
