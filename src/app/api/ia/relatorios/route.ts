import { NextResponse } from 'next/server'
import { iaService } from '@/lib/services/ia.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const relatorio = await iaService.gerarRelatorioPaciente(body)
    return NextResponse.json({ data: relatorio })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
