import { pacienteService } from '@/lib/services/paciente.service'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConsultaForm from './ConsultaForm'

export const metadata = {
  title: 'Nova Consulta | Hospital IA',
}

export default async function CriarConsultaPage() {
  const supabase = await createClient()
  
  // Verify User and Role
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) {
    redirect('/login')
  }

  const { data: userProfile } = await supabase
    .from('professionals')
    .select('*')
    .eq('user_id', authData.user.id)
    .single()

  if (!userProfile) {
    // Only professionals can create consultations
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Consulta</h1>
          <p className="text-muted-foreground mt-1">Acesso Negado</p>
        </div>
        <div className="p-4 bg-destructive/15 text-destructive rounded-md">
          Você não tem permissão para acessar esta página. Apenas médicos e enfermeiros podem criar consultas.
        </div>
      </div>
    )
  }

  // Fetch Patients
  const { data: pacientes } = await pacienteService.getPacientes(1, 1000)

  return (
    <div className="space-y-8 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Consulta</h1>
          <p className="text-muted-foreground mt-1">Registre uma nova consulta médica</p>
        </div>
      <ConsultaForm 
         pacientes={pacientes} 
         professional={userProfile} 
      />
    </div>
  )
}
