import { NextResponse } from 'next/server'
import { iaService } from '@/lib/services/ia.service'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const analise = await iaService.preverSurtos(body)
    return NextResponse.json({ data: analise })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
