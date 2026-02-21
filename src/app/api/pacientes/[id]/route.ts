import { NextResponse } from 'next/server'
import { pacienteService } from '@/lib/services/paciente.service'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const data = await pacienteService.getPacienteById(resolvedParams.id)
  if (!data) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const body = await request.json()
  const data = await pacienteService.updatePaciente(resolvedParams.id, body)
  return NextResponse.json({ data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  await pacienteService.deletePaciente(resolvedParams.id)
  return new NextResponse(null, { status: 204 })
}
