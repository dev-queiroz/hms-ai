import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export const metadata = {
  title: 'Pacientes | Hospital IA',
}

export default function PacientesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Pacientes</h1>
        <p className="text-slate-400">Gerencie todos os pacientes registrados na unidade.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-slate-400">
            Nenhum paciente cadastrado no momento. A listagem completa será implementada em breve.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
