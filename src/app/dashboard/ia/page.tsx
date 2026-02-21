import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Sparkles, Brain } from 'lucide-react'

export const metadata = {
  title: 'Inteligência Artificial | Hospital IA',
}

export default function IADashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Inteligência Artificial</h1>
        <p className="text-slate-400">Acesse ferramentas de IA para diagnóstico, triagem e relatórios.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800 hover:border-teal-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="text-teal-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Previsão de Surtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">
              Analisa métricas e sintomas recentes para prever surtos de doenças virais na região.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors cursor-pointer">
          <CardHeader>
            <CardTitle className="text-blue-400 flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Análise de Prontuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400">
              Gere insights automaticamente baseados no histórico médico e última triagem.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
