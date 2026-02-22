'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createConsultaAction } from '@/actions/consulta'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ConsultaForm({ pacientes, professional }: { pacientes: any[], professional: any }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [pacienteId, setPacienteId] = useState('')

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    formData.append('pacienteId', pacienteId)
    formData.append('unidadeSaudeId', professional.unidade_saude_id || '')

    const result = await createConsultaAction(null, formData)
    setIsPending(false)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.success) {
      toast.success('Consulta registrada com sucesso!')
      router.push('/dashboard/consultas')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Consulta</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Médico/Profissional: <strong>{professional.nome}</strong> | 
          Unidade: <strong>{professional.unidade_saude || 'Automática'}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pacienteId">Paciente</Label>
              <Select onValueChange={setPacienteId} value={pacienteId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} (CPF: {p.cpf})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              placeholder="Descreva os sintomas, diagnóstico e tratamento..."
              className="min-h-32"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cid10">CID-10 (opcional)</Label>
            <Input id="cid10" name="cid10" placeholder="Ex: A09.9" />
          </div>

          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={isPending || !pacienteId}>
              {isPending ? 'Salvando...' : 'Registrar Consulta'}
            </Button>
            <Link href="/dashboard/consultas">
              <Button variant="outline" size="lg" type="button">Cancelar</Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
