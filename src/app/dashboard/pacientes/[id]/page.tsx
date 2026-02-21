export const metadata = {
  title: 'Detalhes do Paciente | Hospital IA',
}

export default async function PacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Paciente #{resolvedParams.id}</h1>
        <p className="text-slate-400">Visualizando prontuário e histórico de triagem.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-slate-300">
        <p>Dados do paciente {resolvedParams.id} serão carregados aqui.</p>
      </div>
    </div>
  )
}
