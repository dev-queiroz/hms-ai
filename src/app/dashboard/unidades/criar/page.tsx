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
import { createUnidadeAction } from '@/actions/unidade'
import { Building2, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function CriarUnidadePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await createUnidadeAction(null, formData)
    
    if (result.error) {
      setError(result.error)
      toast.error('Erro ao cadastrar', { description: result.error })
      setLoading(false)
    } else if (result.success) {
      toast.success('Unidade cadastrada!', { description: 'A nova unidade de saúde está disponível no sistema.' })
      router.push('/dashboard/unidades')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-slate-200">
          <Link href="/dashboard/unidades">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg text-teal-500">
                <Building2 className="w-6 h-6" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-100">Nova Unidade</h1>
                <p className="text-slate-400">Cadastre uma nova unidade de saúde no sistema.</p>
            </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-slate-200">Informações da Unidade</CardTitle>
          <CardDescription className="text-slate-400">Preencha os dados básicos de identificação e localização.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-300">Nome da Unidade *</Label>
              <Input name="nome" id="nome" required className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="Ex: Hospital Regional Central" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo" className="text-slate-300">Tipo de Unidade *</Label>
              <Input name="tipo" id="tipo" required className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="Ex: Hospital Especializado, UBS, UPA" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco" className="text-slate-300">Endereço Completo *</Label>
              <Input name="endereco" id="endereco" required className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="Rua, Número, Bairro - Cidade/UF" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato" className="text-slate-300">Telefone / E-mail de Contato *</Label>
              <Input name="contato" id="contato" required className="bg-slate-800/50 border-slate-700 text-slate-200" placeholder="(00) 0000-0000 ou email@hospital.com" />
            </div>

            <FormError message={error || undefined} />

            <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
              <Button type="button" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white min-w-[150px]" disabled={loading}>
                {loading ? <LoadingSpinner className="text-white" /> : 'Salvar Unidade'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
