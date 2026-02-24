import { pacienteService } from '@/lib/services/paciente.service'
import { notFound } from 'next/navigation'
import { PacienteForm } from '@/components/forms/PacienteForm'

export const metadata = {
  title: 'Editar Paciente | Hospital IA',
}

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const paciente = await pacienteService.getPacienteById(resolvedParams.id)

  if (!paciente) notFound()

  return <PacienteForm paciente={paciente} />
}
