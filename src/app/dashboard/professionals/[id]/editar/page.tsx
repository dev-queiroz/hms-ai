import { professionalsService } from '@/lib/services/professionals.service'
import { unidadeService } from '@/lib/services/unidade.service'
import { ProfessionalForm } from '@/components/forms/ProfessionalForm'
import { notFound } from 'next/navigation'

export default async function EditarProfissionalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  
  const [professional, { data: unidades }] = await Promise.all([
    professionalsService.getProfessionalById(resolvedParams.id),
    unidadeService.getUnidades(1, 100) // Get all units for the form select
  ])

  if (!professional) notFound()

  return <ProfessionalForm professional={professional} unidades={unidades} />
}
