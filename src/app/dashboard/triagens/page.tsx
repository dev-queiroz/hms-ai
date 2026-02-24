import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Activity, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { pacienteService } from "@/lib/services/paciente.service"
import { Pagination } from "@/components/common/Pagination"

export const metadata = {
  title: 'Triagens | Hospital IA',
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function TriagensPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page) || 1
  const limit = 20

  const { data: triagens, count } = await pacienteService.getAllTriagens(page, limit)
  const totalPages = Math.ceil(count / limit)

  const createPageUrl = (newPage: number) => {
    const params = new URLSearchParams()
    if (newPage > 1) params.set('page', newPage.toString())
    return `/dashboard/triagens?${params.toString()}`
  }

  const getRiskColor = (risco: string) => {
    switch (risco?.toLowerCase()) {
      case 'vermelho': return 'bg-red-500/20 text-red-500 border-red-500/50'
      case 'laranja': return 'bg-orange-500/20 text-orange-500 border-orange-500/50'
      case 'amarelo': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
      case 'verde': return 'bg-green-500/20 text-green-500 border-green-500/50'
      case 'azul': return 'bg-blue-500/20 text-blue-500 border-blue-500/50'
      default: return 'bg-slate-500/20 text-slate-500 border-slate-500/50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Fila de Triagem</h1>
          <p className="text-slate-400">Acompanhamento em tempo real das classificações de risco.</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl font-sans">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-500" />
            Triagens Recentes ({count})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {triagens.length === 0 ? (
            <div className="text-center py-20 text-slate-500 flex flex-col items-center">
              <Activity className="w-12 h-12 mb-4 opacity-20" />
              <p>Nenhuma triagem registrada no sistema.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 font-bold">
                    <tr>
                      <th scope="col" className="px-6 py-4">Data/Hora</th>
                      <th scope="col" className="px-6 py-4">Paciente</th>
                      <th scope="col" className="px-6 py-4">Risco</th>
                      <th scope="col" className="px-6 py-4">Sintomas</th>
                      <th scope="col" className="px-6 py-4 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {triagens.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {new Date(t.data_hora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-200">{(t.patients as any)?.nome}</div>
                          <div className="text-[10px] text-slate-500">{(t.patients as any)?.cpf}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getRiskColor(t.classificacao_risco)}`}>
                            {t.classificacao_risco}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="truncate text-slate-400">{t.sintomas}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button asChild variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 h-8">
                            <Link href={`/dashboard/pacientes/${t.patient_id}`}>
                              Abrir Prontuário
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination currentPage={page} totalPages={totalPages} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
