export const metadata = {
  title: 'Relatório IA | Hospital IA',
}

export default async function RelatorioIADetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Relatório de IA #{resolvedParams.id}</h1>
        <p className="text-slate-400">Detalhes da análise e insights gerados pela inteligência artificial.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-slate-300">
        <p>Conteúdo do relatório {resolvedParams.id} gerado pela IA (Groq) aparecerá aqui.</p>
      </div>
    </div>
  )
}
