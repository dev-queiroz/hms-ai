'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createConsultaAction, updateConsultaAction } from '@/actions/consulta'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface ConsultaFormProps {
  consulta?: any
  pacientes?: any[]
  professional: any
}

export default function ConsultaForm({ consulta, pacientes = [], professional }: ConsultaFormProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [pacienteId, setPacienteId] = useState(consulta?.patient_id || '')

  const isEdit = !!consulta?.id

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    
    let result;
    if (isEdit) {
      result = await updateConsultaAction(consulta.id, null, formData)
    } else {
      formData.append('pacienteId', pacienteId)
      formData.append('unidadeSaudeId', professional.unidade_saude_id || '')
      result = await createConsultaAction(null, formData)
    }
    
    setIsPending(false)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.success) {
      toast.success(isEdit ? 'Consulta atualizada!' : 'Consulta registrada!')
      router.push('/dashboard/consultas')
    }
  }

  return (
    <Card className="bg-slate-900 border-slate-800 shadow-xl font-sans">
      <CardHeader>
        <CardTitle className="text-slate-100">{isEdit ? 'Editar Registro de Consulta' : 'Dados da Consulta'}</CardTitle>
        <CardDescription className="text-slate-400 mt-2">
          Profissional: <strong className="text-indigo-400">{professional.nome}</strong> 
          {professional.unidade_saude && (
            <> | Unidade: <strong className="text-emerald-400">{professional.unidade_saude}</strong></>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pacienteId" className="text-slate-300">Paciente</Label>
              {isEdit ? (
                <div className="p-2 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200">
                  {consulta.patients?.nome || 'Paciente'}
                </div>
              ) : (
                <Select onValueChange={setPacienteId} value={pacienteId} required>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200">
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {pacientes.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="text-slate-200 focus:bg-slate-800">
                        {p.nome} (CPF: {p.cpf})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-slate-300">Observações Clínicas</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              placeholder="Descreva os sintomas, diagnóstico e conduta..."
              className="min-h-32 bg-slate-800/50 border-slate-700 text-slate-200 focus:ring-indigo-500"
              required
              defaultValue={consulta?.observacoes || ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cid10" className="text-slate-300">CID-10 (opcional)</Label>
            <Input 
              id="cid10" 
              name="cid10" 
              placeholder="Ex: A09.9" 
              defaultValue={consulta?.cid10 || ''} 
              className="bg-slate-800/50 border-slate-700 text-slate-200"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-800">
            <Button type="submit" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]" disabled={isPending || (!isEdit && !pacienteId)}>
              {isPending ? <LoadingSpinner className="h-4 w-4 mr-2" /> : isEdit ? 'Salvar Alterações' : 'Registrar Consulta'}
            </Button>
            <Link href="/dashboard/consultas">
              <Button variant="ghost" size="lg" type="button" className="text-slate-400 hover:text-slate-200">Cancelar</Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
