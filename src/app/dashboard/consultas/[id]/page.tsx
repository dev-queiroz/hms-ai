import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { consultaService } from '@/lib/services/consulta.service'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Stethoscope, FileText } from 'lucide-react'

export const metadata = {
  title: 'Detalhes da Consulta | Hospital IA',
}

export default async function ConsultaDetalhesPage({ params }: { params: { id: string } }) {
  const consulta = await consultaService.getConsultaById(params.id)

  if (!consulta) {
    return (
      <div className="space-y-10 pb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consulta não encontrada</h1>
        </div>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900">
          <CardContent className="pt-10 text-center">
            <p className="text-xl mb-8">Não foi possível carregar os dados da consulta.</p>
            <Link href="/dashboard/consultas">
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

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consulta - #{consulta.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground mt-1">{new Date(consulta.data_hora).toLocaleDateString('pt-BR')}</p>
        </div>
        <Link href="/dashboard/consultas">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Informações da Consulta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              Informações da Consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Data e Hora</p>
              <p className="text-xl font-semibold">{new Date(consulta.data_hora).toLocaleString('pt-BR')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CID-10</p>
              <p className="font-mono text-lg">{consulta.cid10 || 'Não informado'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="h-6 w-6 text-green-600" />
              Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{consulta.patients?.nome}</p>
            <p className="text-sm text-muted-foreground mt-1">CPF: {consulta.patients?.cpf}</p>
          </CardContent>
        </Card>

        {/* Médico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-purple-600" />
              Médico Responsável
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{consulta.professionals?.nome}</p>
            <p className="text-sm text-muted-foreground mt-1">CRM/COREN: {consulta.professionals?.crm_coren}</p>
          </CardContent>
        </Card>
      </div>

      {/* Observações */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-orange-600" />
            Observações da Consulta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-lg leading-relaxed">
            {consulta.observacoes || 'Nenhuma observação registrada. (Verifique o Prontuário)'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
