import { Button } from '@/components/ui/button'
import { Eye, FileDown, Edit } from 'lucide-react'
import Link from 'next/link'
import { prontuarioService } from '@/lib/services/prontuario.service'
import { checkPermission, MEDICAL_ROLES } from '@/lib/auth/rbac'

export const metadata = {
  title: 'Prontuários Clínicos | Hospital IA',
}

export default async function ProntuariosPage() {
  const { authorized, role } = await checkPermission(MEDICAL_ROLES)

  if (!authorized) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prontuários Clínicos</h1>
          <p className="text-muted-foreground mt-1">Acesso Negado</p>
        </div>
        <div className="p-4 bg-destructive/15 text-destructive rounded-md">
          Você não tem permissão para acessar esta página. Sua role ({role}) não permite visualizar prontuários.
        </div>
      </div>
    )
  }

  const prontuarios = await prontuarioService.getProntuarios()
  const totalProntuarios = prontuarios.length

  return (
    <div className="space-y-10 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prontuários Clínicos</h1>
          <p className="text-muted-foreground mt-1">Histórico completo de atendimentos e evoluções dos pacientes</p>
        </div>
        {/* We link "Novo Prontuário" to the patients list since a patient is required to start a prontuário */}
        <Link href="/dashboard/pacientes">
          <Button>Novo Prontuário</Button>
        </Link>
      </div>

      <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
        <div className="border-b bg-muted/40 px-6 py-4">
          <span className="text-lg font-semibold text-foreground">
            Total: {totalProntuarios} prontuário{totalProntuarios !== 1 ? 's' : ''} registrado{totalProntuarios !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Último Profissional</th>
                <th className="px-6 py-4">Última Evolução</th>
                <th className="px-6 py-4">CID-10</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {prontuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                    Nenhum prontuário registrado.
                  </td>
                </tr>
              ) : (
                prontuarios.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{item.paciente_nome}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">CPF: {item.paciente_cpf}</div>
                    </td>
                    <td className="px-6 py-4">{item.ultimo_profissional}</td>
                    <td className="px-6 py-4">{new Date(item.ultima_atualizacao).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                    <td className="px-6 py-4 font-mono text-sm">{item.ultimo_cid10 || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/api/pacientes/${item.patient_id}/pdf`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-purple-100 hover:text-purple-600">
                            <FileDown className="h-4 w-4" />
                          </Button>
                        </Link>
                        {/* the eye redirects to the patient view which contains the timeline of the prontuario */}
                        <Link href={`/dashboard/pacientes/${item.patient_id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-blue-100 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/pacientes/${item.patient_id}/prontuario/nova`}>
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
