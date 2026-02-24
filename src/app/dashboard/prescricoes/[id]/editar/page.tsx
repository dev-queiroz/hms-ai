import { prescricaoService } from '@/lib/services/prescricao.service'
import { pacienteService } from '@/lib/services/paciente.service'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import PrescricaoForm from '../../criar/PrescricaoForm'

export const metadata = {
  title: 'Editar Prescrição | Hospital IA',
}

export default async function EditarPrescricaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
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
    redirect('/dashboard')
  }

  const [prescricao, { data: pacientes }] = await Promise.all([
    prescricaoService.getPrescricaoById(id),
    pacienteService.getPacientes(1, 1000)
  ])

  if (!prescricao) {
    notFound()
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Editar Prescrição</h1>
        <p className="text-slate-400 mt-1">Atualize os detalhes da prescrição #{id.slice(0, 8)}</p>
      </div>
      <PrescricaoForm 
        pacientes={pacientes} 
        professional={userProfile} 
        initialData={prescricao}
      />
    </div>
  )
}
