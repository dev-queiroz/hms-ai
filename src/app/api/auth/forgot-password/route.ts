import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
  }

  // Mock: Em produção, você enviaria um email real aqui
  console.log(`[Mock] Forgot password requested for: ${email}`)

  return NextResponse.json({ message: 'Se um usuário com este email existir, um link de recuperação foi enviado.' })
}
