import Link from "next/link"
import { professionalsService } from "@/lib/services/professionals.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Stethoscope, ShieldCheck, User } from "lucide-react"

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  professional: { label: 'Profissional', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
}

import { createClient } from "@/lib/supabase/server"

export default async function ProfessionalsPage() {
  const supabase = await createClient()
  
  // 1. Get logged-in user info to check role and unit
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: loggedProf } = await supabase
    .from('professionals')
    .select('role, unidade_saude_id')
    .eq('user_id', user?.id)
    .single()

  // 2. Determine if we should filter by unit
  const isAdmin = (loggedProf as any)?.role === 'admin'
  const filterUnitId = isAdmin ? undefined : (loggedProf as any)?.unidade_saude_id

  const professionals = await professionalsService.getProfessionals(filterUnitId as string | undefined)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">Equipe de Profissionais</h1>
          <p className="text-slate-400">Gerenciamento de médicos, enfermeiros e administradores.</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Link href="/register-admin">
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Profissional
          </Link>
        </Button>
      </div>

      {professionals.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Stethoscope className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-medium">Nenhum profissional cadastrado.</p>
            <p className="text-sm mt-1">Comece cadastrando o primeiro profissional da equipe.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map((prof: any) => {
            const roleInfo = roleLabels[prof.role] || { label: prof.role, color: 'text-slate-400 bg-slate-800 border-slate-700' }
            return (
              <Card key={prof.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        {prof.role === 'admin' ? (
                          <ShieldCheck className="w-5 h-5 text-rose-400" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base text-slate-100">{prof.nome}</CardTitle>
                        <p className="text-xs text-slate-500">{prof.crm_coren}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-1 border-t border-slate-800">
                  {prof.cargo && <p className="text-xs text-slate-400 pt-3">{prof.cargo}</p>}
                  {prof.especializacao && <p className="text-xs text-slate-500">{prof.especializacao}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
