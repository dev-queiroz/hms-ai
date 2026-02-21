import { NextResponse } from 'next/server'
import { pacienteService } from '@/lib/services/paciente.service'

export async function GET() {
  const data = await pacienteService.getPacientes()
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const body = await request.json()
  const data = await pacienteService.createPaciente(body)
  return NextResponse.json({ data }, { status: 201 })
}
