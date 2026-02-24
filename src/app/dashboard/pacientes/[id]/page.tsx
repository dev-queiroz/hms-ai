import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft, FileText, Activity, Clock, Plus, User, Shield, Download, Pencil } from "lucide-react"
import { pacienteService } from "@/lib/services/paciente.service"
import { Label } from "@/components/ui/label"
import { AISummary } from "@/components/common/AISummary"
import { notFound } from "next/navigation"

export const metadata = {
  title: 'Prontuário do Paciente | Hospital IA',
}

export default async function PacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  
  const paciente = await pacienteService.getPacienteById(resolvedParams.id)
  if (!paciente) {
    notFound()
  }

  const prontuario = await pacienteService.getProntuarioByPatientId(resolvedParams.id)
  const triagens = await pacienteService.getTriagensByPatientId(resolvedParams.id)

  // Helper para exibir o texto decriptado (o view do pg_sodium geralmente fornece colunas 'decrypted_column')
  const getCleanText = (decryptedValue: any, originalValue: any) => {
    const val = decryptedValue || originalValue
    if (!val) return 'Não informado'
    return typeof val === 'string' ? val : JSON.stringify(val)
  }

  // Processar histórico do prontuário
  const historyRaw = prontuario?.history
  const hasHistory = !!historyRaw
  
  // Se o histórico for um objeto de dados (como veio no print do usuário) e não uma lista de notas
  const isDataObject = hasHistory && !Array.isArray(historyRaw) && (historyRaw as any).alergias !== undefined

  const historicoNotas: any[] = hasHistory ? 
    (Array.isArray(historyRaw) ? historyRaw : isDataObject ? [] : [historyRaw]) 
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-slate-200">
              <Link href="/dashboard/pacientes">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">{paciente.nome}</h1>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400 ml-10">
            <span><span className="text-slate-500">CPF:</span> {paciente.cpf}</span>
            <span><span className="text-slate-500">Nasc:</span> {new Date(paciente.data_nasc).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</span>
            <span><span className="text-slate-500">SUS:</span> {paciente.sus_number}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
            <Link href={`/api/pacientes/${resolvedParams.id}/pdf`} target="_blank">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
            <Link href={`/dashboard/pacientes/${resolvedParams.id}/triagem/nova`}>
              <Activity className="w-4 h-4 mr-2" />
              Nova Triagem
            </Link>
          </Button>
          <AISummary patientId={resolvedParams.id} />
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link href={`/dashboard/pacientes/${resolvedParams.id}/prontuario/nova`}>
              <Plus className="w-4 h-4 mr-2" />
              Evolução
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* COLUNA ESQUERDA: INFOS E TRIAGENS (1/4) */}
        <div className="space-y-6 lg:col-span-1">
          {/* PARECER IA SE JÁ EXISTIR NO TOPO DA SIDEBAR? Opcional se já estiver no botão.
              Vou deixar apenas dentro do AISummary que já se transforma em card ao carregar. */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                <User className="w-4 h-4" /> Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div>
                <Label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Endereço</Label>
                <p className="text-sm text-slate-200 leading-snug">{getCleanText((paciente as any).decrypted_endereco, paciente.endereco)}</p>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Contato</Label>
                <p className="text-sm text-slate-200">{getCleanText((paciente as any).decrypted_contato, paciente.contato)}</p>
              </div>
              <div>
                <Label className="text-[10px] uppercase text-slate-500 font-bold mb-1 block">Documento RG</Label>
                <p className="text-sm text-slate-200">{getCleanText((paciente as any).decrypted_rg, paciente.rg)}</p>
              </div>
            </CardContent>
          </Card>

          {isDataObject && (
            <Card className="bg-indigo-950/20 border-indigo-500/30">
              <CardHeader className="pb-2 border-b border-indigo-500/20">
                <CardTitle className="text-xs font-bold text-indigo-400 flex items-center gap-2 uppercase">
                  <Shield className="w-3 h-3" /> Alerta Clínico
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 space-y-2">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Alergias</span>
                  <p className="text-sm text-rose-400 font-semibold">{(historyRaw as any).alergias || 'Nenhuma'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Doenças Crônicas</span>
                  <p className="text-sm text-slate-200 font-medium">{(historyRaw as any).doencas_cronicas || 'Nenhuma'}</p>
                </div>
                { (historyRaw as any).observacoes && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Observações</span>
                    <p className="text-xs text-slate-300 italic">{(historyRaw as any).observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                <Activity className="w-4 h-4" /> Triagem Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              {triagens.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm italic">
                  Sem triagens.
                </div>
              ) : (
                <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar divide-y divide-slate-800/50">
                  {triagens.map((triagem) => (
                    <div key={triagem.id} className="p-4 hover:bg-slate-800/20 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                          triagem.classificacao_risco === 'Vermelho' ? 'bg-red-500/20 text-red-500' :
                          triagem.classificacao_risco === 'Laranja' ? 'bg-orange-500/20 text-orange-500' :
                          triagem.classificacao_risco === 'Amarelo' ? 'bg-yellow-500/20 text-yellow-500' :
                          triagem.classificacao_risco === 'Verde' ? 'bg-green-500/20 text-green-500' :
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {triagem.classificacao_risco || 'Normal'}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(triagem.data_hora).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">
                         {triagem.sintomas || 'Sem queixas registradas'}
                         {(triagem.sinais_vitais as any)?.temperatura && (
                           <span className="block text-[10px] text-teal-500 mt-1">
                             T: {(triagem.sinais_vitais as any).temperatura}ºC | PA: {(triagem.sinais_vitais as any).pressao_arterial}
                           </span>
                         )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: EVOLUÇÃO (3/4) */}
        <div className="space-y-6 lg:col-span-3">
          <Card className="bg-slate-900 border-slate-800 h-full min-h-[600px]">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                <FileText className="w-4 h-4" /> Linha do Tempo da Evolução
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              {historicoNotas.length === 0 ? (
                <div className="text-center py-20 text-slate-500 flex flex-col items-center">
                  <div className="p-4 bg-slate-800/30 rounded-full mb-4">
                    <FileText className="w-10 h-10 text-slate-700" />
                  </div>
                  <p className="font-medium text-slate-400">Nenhuma evolução clínica registrada.</p>
                  <p className="text-xs mt-1 text-slate-600 max-w-xs mx-auto">As notas médicas e observações de enfermagem aparecerão aqui cronologicamente.</p>
                  <Button asChild variant="outline" className="mt-8 border-slate-700 text-slate-300 hover:bg-slate-800">
                    <Link href={`/dashboard/pacientes/${resolvedParams.id}/prontuario/nova`}>
                      <Plus className="w-4 h-4 mr-2" /> Iniciar Prontuário
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-800">
                    {historicoNotas.map((nota, index) => (
                      <div key={index} className="relative flex items-start gap-6 pl-1 group">
                        {/* Timeline Dot */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-slate-700 bg-slate-900 shadow shrink-0 z-10 text-teal-500 mt-1">
                          <FileText className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 bg-slate-800/20 p-5 rounded-lg border border-slate-800/50 hover:border-slate-700 transition-all shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                              <span className="font-bold text-slate-200">{nota.profissional || 'Profissional'}</span>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                              {nota.data ? new Date(nota.data).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Sem data'}
                            </span>
                          </div>
                          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {nota.descricao || (typeof nota === 'string' ? nota : JSON.stringify(nota, null, 2))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
