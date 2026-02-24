import { professionalsService } from '@/lib/services/professionals.service'
import { unidadeService } from '@/lib/services/unidade.service'
import { ProfessionalForm } from '@/components/forms/ProfessionalForm'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function EditarProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  // Verify access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('professionals')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if ((profile as any)?.role !== 'admin') {
    redirect('/dashboard')
  }

  const [professional, { data: unidades }] = await Promise.all([
    professionalsService.getProfessionalById(resolvedParams.id),
    unidadeService.getUnidades(1, 100)
  ])

  if (!professional) notFound()

  return <ProfessionalForm professional={professional} unidades={unidades} />
}
