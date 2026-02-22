'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPrescricaoAction } from '@/actions/prescricao'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'

type Medicamento = {
  nome: string
  dosagem: string
  frequencia: string
  via: string
}

export default function PrescricaoForm({ pacientes, professional }: { pacientes: any[], professional: any }) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [pacienteId, setPacienteId] = useState('')
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([
    { nome: '', dosagem: '', frequencia: '', via: 'Uso Oral' }
  ])

  const addMedicamento = () => {
    setMedicamentos([...medicamentos, { nome: '', dosagem: '', frequencia: '', via: 'Uso Oral' }])
  }

  const removeMedicamento = (index: number) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index))
  }

  const updateMedicamento = (index: number, field: keyof Medicamento, value: string) => {
    const newMeds = [...medicamentos]
    newMeds[index][field] = value
    setMedicamentos(newMeds)
  }

  async function handleSubmit(formData: FormData) {
    if (!pacienteId) {
      toast.error('Selecione um paciente.')
      return
    }

    // Validate medicamentos
    const validMeds = medicamentos.filter(m => m.nome.trim() !== '')
    if (validMeds.length === 0) {
      toast.error('Adicione pelo menos um medicamento válido.')
      return
    }

    setIsPending(true)
    formData.append('pacienteId', pacienteId)
    formData.append('medicamentosJson', JSON.stringify(validMeds))

    const result = await createPrescricaoAction(null, formData)
    setIsPending(false)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.success) {
      toast.success('Prescrição emitida com sucesso!')
      router.push('/dashboard/prescricoes')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da Prescrição</CardTitle>
        <CardDescription>
          Médico Responsável: <strong>{professional.nome}</strong> (CRM/COREN: {professional.crm_coren})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label>Paciente</Label>
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

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <Label className="text-base font-semibold">Medicamentos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedicamento}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </div>
            
            {medicamentos.map((med, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                <div className="md:col-span-4 space-y-2">
                  <Label>Nome do Medicamento</Label>
                  <Input 
                    value={med.nome} 
                    onChange={e => updateMedicamento(index, 'nome', e.target.value)} 
                    placeholder="Ex: Dipirona 500mg" 
                    required 
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Dosagem/Qtd</Label>
                  <Input 
                    value={med.dosagem} 
                    onChange={e => updateMedicamento(index, 'dosagem', e.target.value)} 
                    placeholder="Ex: 1 comprimido" 
                    required 
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Frequência</Label>
                  <Input 
                    value={med.frequencia} 
                    onChange={e => updateMedicamento(index, 'frequencia', e.target.value)} 
                    placeholder="Ex: 8/8h" 
                    required 
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label>Via</Label>
                  <Input 
                    value={med.via} 
                    onChange={e => updateMedicamento(index, 'via', e.target.value)} 
                    placeholder="Oral" 
                  />
                </div>
                <div className="md:col-span-1 pt-8 flex justify-end">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-100"
                    onClick={() => removeMedicamento(index)}
                    disabled={medicamentos.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cid10">CID-10 Principal (Opcional)</Label>
              <Input id="cid10" name="cid10" placeholder="Ex: A09.9" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Recomendações / Observações</Label>
            <Textarea
              id="observacoes"
              name="observacoes"
              placeholder="Instruções adicionais para o paciente..."
              className="min-h-24"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? 'Emitindo...' : 'Emitir Prescrição'}
            </Button>
            <Link href="/dashboard/prescricoes">
              <Button variant="outline" size="lg" type="button">Cancelar</Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
