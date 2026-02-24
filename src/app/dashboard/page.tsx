import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, AlertTriangle, TrendingUp, Calendar, ChevronRight } from "lucide-react"
import { dashboardService } from "@/lib/services/dashboard.service"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: professional } = await (supabase
    .from('professionals') as any)
    .select('role, nome, unidade_saude_id, unidades_saude(nome)')
    .eq('user_id', user.id)
    .single()

  const isAdmin = (professional as any)?.role === 'admin'
  const unitId = isAdmin ? undefined : (professional as any)?.unidade_saude_id
  const unitName = (professional as any)?.unidades_saude?.nome || 'Gestão Global'

  const stats = await dashboardService.getStats(unitId)

  const cards = [
    {
      title: "Pacientes Registrados",
      value: stats.totalPacientes.toString(),
      description: "Total na base de dados",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Triagens Hoje",
      value: stats.triagensHoje.toString(),
      description: "Atendimentos realizados hoje",
      icon: Activity,
      color: "text-teal-500",
      bg: "bg-teal-500/10"
    },
    {
      title: "Casos Críticos",
      value: stats.criticosHoje.toString(),
      description: "Risco Vermelho/Laranja hoje",
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Índice de Urgência",
      value: `${stats.taxaRisco}%`,
      description: "Percentual de casos graves",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 italic">
          Olá, {(professional as any)?.nome?.split(' ')[0] || 'Profissional'}
        </h1>
        <p className="text-slate-400">
          Unidade: <span className="text-indigo-400 font-semibold">{unitName}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="bg-slate-900 border-slate-800 shadow-lg border-l-4 border-l-slate-800 hover:border-l-indigo-500 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">{card.value}</div>
              <p className="text-xs text-slate-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild className="h-20 bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-200 justify-between group" variant="outline">
              <Link href="/dashboard/pacientes/novo">
                <div className="flex flex-col items-start px-2">
                  <span className="font-bold">Cadastrar Paciente</span>
                  <span className="text-[10px] text-slate-500">Novo registro na base</span>
                </div>
                <Users className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Button>
            <Button asChild className="h-20 bg-teal-900/10 hover:bg-teal-900/20 border-teal-500/20 text-teal-100 justify-between group" variant="outline">
              <Link href="/dashboard/pacientes">
                <div className="flex flex-col items-start px-2">
                  <span className="font-bold">Iniciar Atendimento</span>
                  <span className="text-[10px] text-teal-500/60">Buscar paciente para triagem</span>
                </div>
                <Activity className="w-8 h-8 opacity-20 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-full lg:col-span-3 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Alertas de Saúde Pública</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-200">Resumo Semanal de IA</h4>
                  <p className="text-xs text-rose-300/70">Análise de triagens indica estabilidade nos quadros respiratórios. Recomendamos atenção redobrada à higienização das áreas comuns devido ao aumento da umidade local.</p>
                </div>
              </div>
              <Button asChild variant="ghost" className="w-full text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5">
                <Link href="/dashboard/ia">
                  Ver Análise Epidemiológica Completa
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
