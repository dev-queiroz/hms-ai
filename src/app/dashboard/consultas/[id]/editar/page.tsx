import { consultaService } from '@/lib/services/consulta.service'
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ConsultaForm from '@/components/forms/ConsultaForm'

export const metadata = {
  title: 'Editar Consulta | Hospital IA',
}

export default async function EditarConsultaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  // 1. Verify access
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

  // 2. Fetch Consulta Details
  const consulta = await consultaService.getConsultaById(resolvedParams.id)

  if (!consulta) notFound()

  // 3. Check if professional is allowed to edit
  // Only the professional who created it or an admin can edit
  const isOwner = (consulta as any).professional_id === (userProfile as any).id
  const isAdmin = (userProfile as any).role === 'admin'

  if (!isOwner && !isAdmin) {
    redirect('/dashboard/consultas')
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Editar Consulta</h1>
        <p className="text-slate-400 mt-1">Atualize as observações clínicas e códigos CID-10</p>
      </div>
      <ConsultaForm 
        consulta={consulta}
        professional={userProfile} 
      />
    </div>
  )
}
