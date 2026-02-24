
import { Button } from '@/components/ui/button'
import { Edit, Eye } from 'lucide-react'
import Link from 'next/link'
import { consultaService } from '@/lib/services/consulta.service'
import { Pagination } from '@/components/common/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { DeleteButton } from '@/components/common/DeleteButton'
import { deleteConsultaAction } from '@/actions/consulta'
// Assuming we might not have the complete DataTable component from the frontend module, but let's implement a simple table for now. 

export const metadata = {
  title: 'Consultas | Hospital IA',
}

export default async function ConsultasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string, query?: string }>
}) {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const limit = 10
  const search = params?.query || ''

  const { data: consultas, count } = await consultaService.getConsultas(page, limit, search)
  const totalPages = Math.ceil(count / limit)

  return (
    <div className="space-y-10 pb-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultas</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as consultas realizadas no sistema</p>
        </div>
        <Link href="/dashboard/consultas/criar">
          <Button>Nova Consulta</Button>
        </Link>
      </div>

      <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
        <div className="border-b bg-muted/40 px-6 py-4">
          <span className="text-lg font-semibold text-foreground">
            Total: {count} consulta{count !== 1 ? 's' : ''} registrada{count !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Paciente</th>
                <th className="px-6 py-4 font-medium">Médico</th>
                <th className="px-6 py-4 font-medium">Data da Consulta</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {consultas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    Nenhuma consulta encontrada.
                  </td>
                </tr>
              ) : (
                consultas.map((item: any) => (
                  <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.patients?.nome || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {item.professionals?.nome || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(item.data_hora).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/consultas/${item.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/consultas/${item.id}/editar`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteButton 
                          id={item.id} 
                          action={deleteConsultaAction} 
                          title="Excluir Consulta?"
                          description="Esta ação removerá o registro da consulta. O histórico no prontuário não será removido automaticamente para segurança clínica."
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}
