import { unidadeService } from '@/lib/services/unidade.service'
import { ProfessionalForm } from '@/components/forms/ProfessionalForm'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function CriarProfissionalPage() {
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

  const { data: unidades } = await unidadeService.getUnidades(1, 100)

  // Pass professional as null to indicate create mode
  return <ProfessionalForm professional={null} unidades={unidades} />
}
