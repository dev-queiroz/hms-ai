import { Button } from '@/components/ui/button'
import { FileDown, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import { prescricaoService } from '@/lib/services/prescricao.service'
import { checkPermission, MEDICAL_ROLES } from '@/lib/auth/rbac'

export const metadata = {
  title: 'Prescrições | Hospital IA',
}

export default async function PrescricoesPage() {
  const { authorized, role } = await checkPermission(MEDICAL_ROLES)

  if (!authorized) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescrições</h1>
          <p className="text-muted-foreground mt-1">Acesso Negado</p>
        </div>
        <div className="p-4 bg-destructive/15 text-destructive rounded-md">
          Você não tem permissão para acessar esta página. Sua role ({role}) não permite gerenciar prescrições.
        </div>
      </div>
    )
  }

  const prescricoes = await prescricaoService.getPrescricoes()
  const totalPrescricoes = prescricoes.length

  return (
    <div className="space-y-10 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescrições</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as prescrições médicas emitidas</p>
        </div>
        <Link href="/dashboard/prescricoes/criar">
          <Button>Nova Prescrição</Button>
        </Link>
      </div>

      <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
        <div className="border-b bg-muted/40 px-6 py-4">
          <span className="text-lg font-semibold text-foreground">
            Total: {totalPrescricoes} prescrição{totalPrescricoes !== 1 ? 'ões' : 'ão'} emitida{totalPrescricoes !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Médico Responsável</th>
                <th className="px-6 py-4">Data de Criação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {prescricoes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                    Nenhuma prescrição registrada.
                  </td>
                </tr>
              ) : (
                prescricoes.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{item.paciente_nome}</div>
                    </td>
                    <td className="px-6 py-4">{item.medico_nome}</td>
                    <td className="px-6 py-4">{new Date(item.data_criacao).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/api/prescricoes/${item.id}/pdf`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-purple-100 hover:text-purple-600">
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/prescricoes/${item.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-blue-100 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/prescricoes/${item.id}/editar`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-green-100 hover:text-green-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
