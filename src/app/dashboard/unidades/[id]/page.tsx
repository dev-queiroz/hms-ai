import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Building2, ChevronLeft, MapPin, Phone, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import { unidadeService } from '@/lib/services/unidade.service'
import { professionalsService } from '@/lib/services/professionals.service'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export default async function UnidadeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = resolvedParams.id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [unidade, userProfile] = await Promise.all([
    unidadeService.getUnidadeById(id),
    supabase.from('professionals').select('role').eq('user_id', user.id).single() as any
  ])

  if (!unidade) notFound()

  const isAdmin = userProfile.data?.role === 'admin'
  const { data: professionals } = (await professionalsService.getProfessionals(id, 1, 100)) as any

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-slate-200">
            <Link href="/dashboard/unidades">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-100">{unidade.nome}</h1>
              <Badge variant="outline" className="text-teal-400 border-teal-500/30 bg-teal-500/10">
                {unidade.tipo}
              </Badge>
            </div>
            <p className="text-slate-400">Dados cadastrais e equipe da unidade.</p>
          </div>
        </div>
        {isAdmin && (
          <Button asChild className="bg-teal-600 hover:bg-teal-700 text-white">
            <Link href={`/dashboard/unidades/${id}/editar`}>
              Editar Unidade
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 bg-slate-900 border-slate-800 shadow-xl self-start">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-500" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label className="text-slate-500 text-[10px] uppercase font-bold">Endereço</Label>
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-4 h-4 mt-1 text-slate-500 shrink-0" />
                <span className="text-sm">{unidade.endereco}</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-500 text-[10px] uppercase font-bold">Contato</Label>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-sm">{unidade.contato}</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-slate-500 text-[10px] uppercase font-bold">Responsável Técnico</Label>
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-sm">{unidade.professionals?.nome || 'Não Atribuído'}</span>
              </div>
              {unidade.professionals?.crm_coren && (
                <p className="text-xs text-slate-500 ml-6">{unidade.professionals.crm_coren}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-slate-500 text-[10px] uppercase font-bold">Data de Cadastro</Label>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-sm">{new Date(unidade.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-800/30 border-b border-slate-800">
            <CardTitle className="text-slate-200">Equipe Profissional ({professionals.length})</CardTitle>
            <CardDescription className="text-slate-400">Todos os profissionais vinculados a esta unidade.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {professionals.length === 0 ? (
              <div className="p-10 text-center text-slate-500 italic">
                Nenhum profissional vinculado a esta unidade.
              </div>
            ) : (
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Função</th>
                    <th className="px-6 py-3">CRM/COREN</th>
                    <th className="px-6 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {professionals.map((prof: any) => (
                    <tr key={prof.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-200">{prof.nome}</td>
                      <td className="px-6 py-4 text-slate-400">{prof.cargo || prof.role}</td>
                      <td className="px-6 py-4 text-slate-500">{prof.crm_coren || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <Button asChild variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300">
                          <Link href={`/dashboard/professionals/${prof.id}`}>Ver Perfil</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>
}
