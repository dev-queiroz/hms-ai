import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prescricaoService } from '@/lib/services/prescricao.service'
import Link from 'next/link'
import { ArrowLeft, User, Stethoscope, Pill, CalendarClock } from 'lucide-react'

export const metadata = {
  title: 'Detalhes da Prescrição | Hospital IA',
}

export default async function PrescricaoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  const prescricao = await prescricaoService.getPrescricaoById(id)

  if (!prescricao) {
    return (
      <div className="space-y-10 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescrição não encontrada</h1>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900">
          <CardContent className="pt-10 text-center">
            <p className="text-xl mb-8">Não foi possível carregar os dados da prescrição.</p>
            <Link href="/dashboard/prescricoes">
              <Button variant="outline" size="lg">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Voltar para lista
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { medicamentos, observacoes, cid10 } = prescricao.detalhes || {}

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescrição - #{prescricao.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground mt-1">
            Emitida em {new Date(prescricao.data).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/api/prescricoes/${prescricao.id}/pdf`} target="_blank">
            <Button variant="outline">Imprimir PDF</Button>
          </Link>
          <Link href="/dashboard/prescricoes">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Medicamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Pill className="h-6 w-6 text-teal-600" />
                Medicamentos Prescritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {medicamentos && medicamentos.length > 0 ? (
                <div className="space-y-6">
                  {medicamentos.map((med: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-lg text-foreground">{med.nome}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground mt-2">
                          <p><strong className="text-foreground">Dosagem:</strong> {med.dosagem}</p>
                          <p><strong className="text-foreground">Frequência:</strong> {med.frequencia}</p>
                          <p><strong className="text-foreground">Via:</strong> {med.via || 'Uso Oral'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">Nenhum medicamento listado nesta prescrição.</p>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {(observacoes || cid10) && (
            <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="text-amber-800 dark:text-amber-500 text-base">Complementos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cid10 && (
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase">CID-10 Principal</span>
                    <p className="font-mono text-lg">{cid10}</p>
                  </div>
                )}
                {observacoes && (
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground uppercase">Observações Médicas</span>
                    <p className="whitespace-pre-wrap mt-1">{observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          {/* Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-5 w-5 text-indigo-600" />
                Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{prescricao.patients?.nome}</p>
              <div className="space-y-1 mt-3 text-sm text-muted-foreground">
                <p>CPF: {prescricao.patients?.cpf}</p>
                <p>Nascimento: {new Date(prescricao.patients?.data_nasc).toLocaleDateString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Médico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Stethoscope className="h-5 w-5 text-indigo-600" />
                Médico Restritor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{prescricao.professionals?.nome}</p>
              <div className="space-y-1 mt-3 text-sm text-muted-foreground">
                <p>CRM/COREN: {prescricao.professionals?.crm_coren}</p>
                <p>Especialidade: {prescricao.professionals?.especializacao || 'Clínico Geral'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
