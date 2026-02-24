import { unidadeService } from '@/lib/services/unidade.service'
import { professionalsService } from '@/lib/services/professionals.service'
import { UnidadeForm } from '@/components/forms/UnidadeForm'
import { notFound } from 'next/navigation'

export default async function EditarUnidadePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  
  const [unidade, { data: professionals }] = await Promise.all([
    unidadeService.getUnidadeById(resolvedParams.id),
    professionalsService.getProfessionals(undefined, 1, 100)
  ])

  if (!unidade) notFound()

  return <UnidadeForm unidade={unidade} professionals={professionals} />
}
