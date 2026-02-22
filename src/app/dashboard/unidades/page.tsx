import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2, Building2 } from 'lucide-react'
import Link from 'next/link'
import { unidadeService } from '@/lib/services/unidade.service'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Unidades de Saúde | Hospital IA',
}

export default async function UnidadesPage() {
  const supabase = await createClient()
  
  // Verify User Role (Requires Admin role generally, but in this case let's allow "Administrador Principal" or just "Administrador")
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    redirect('/login')
  }

  const { data: userProfile } = await supabase
    .from('professionals')
    .select('role')
    .eq('user_id', authData.user.id)
    .single()

  const isEditor = userProfile && (userProfile as any).role === 'admin'

  const unidades = await unidadeService.getUnidades()
  const totalUnidades = unidades.length

  return (
    <div className="space-y-10 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Unidades de Saúde</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as unidades cadastradas no sistema</p>
        </div>
        {isEditor && (
          <Link href="/dashboard/unidades/criar">
            <Button>Nova Unidade</Button>
          </Link>
        )}
      </div>

      <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
        <div className="border-b bg-muted/40 px-6 py-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-teal-600" />
            <span className="text-lg font-semibold text-foreground">
                Total: {totalUnidades} unidade{totalUnidades !== 1 ? 's' : ''} cadastrada{totalUnidades !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-muted-foreground font-medium border-b">
              <tr>
                <th className="px-6 py-4">Nome da Unidade</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Endereço</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {unidades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground italic">
                    Nenhuma unidade de saúde registrada.
                  </td>
                </tr>
              ) : (
                unidades.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{item.nome}</div>
                      {item.responsavel_nome !== 'Não Atribuído' && (
                        <div className="text-xs text-muted-foreground mt-0.5">Resp: {item.responsavel_nome}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                        {item.tipo}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[250px] truncate text-muted-foreground" title={item.endereco}>
                        {item.endereco}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{item.contato}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/unidades/${item.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-blue-100 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {isEditor && (
                          <>
                            <Link href={`/dashboard/unidades/${item.id}/editar`}>
                              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-green-100 hover:text-green-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-red-100 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
