import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import PDFDocument from 'pdfkit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Use admin client to bypass RLS — PDF routes have no user session
    const { data: prescricao, error } = await supabaseAdmin
      .from('prescricoes')
      .select(`
        *,
        patients ( nome, cpf, data_nasc ),
        professionals ( nome, crm_coren, especializacao )
      `)
      .eq('id', id)
      .single()

    if (error || !prescricao) {
      return NextResponse.json({ error: 'Prescrição não encontrada' }, { status: 404 })
    }

    const p = prescricao as any

    const doc = new PDFDocument({ margin: 50 })
    const chunks: Buffer[] = []

    return new Promise<NextResponse>((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => {
        const result = Buffer.concat(chunks)
        resolve(new NextResponse(result, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=prescricao_${id.slice(0, 8)}.pdf`,
          },
        }))
      })

      // Header
      doc.fontSize(20).text('PRESCRIÇÃO MÉDICA - HOSPITAL IA', { align: 'center' })
      doc.moveDown()
      doc.fontSize(10).text(`Emitida em: ${new Date(p.data).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, { align: 'right' })
      doc.moveDown()

      // Patient info
      doc.fontSize(14).text('DADOS DO PACIENTE', { underline: true })
      doc.fontSize(12).text(`Nome: ${p.patients?.nome || 'Não informado'}`)
      doc.text(`CPF: ${p.patients?.cpf || 'Não informado'}`)
      if (p.patients?.data_nasc) {
        doc.text(`Nascimento: ${new Date(p.patients.data_nasc).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`)
      }
      doc.moveDown()

      // Medications
      doc.fontSize(14).text('MEDICAMENTOS PRESCRITOS', { underline: true })
      doc.moveDown(0.5)

      const medicamentos = p.detalhes?.medicamentos || []
      if (medicamentos.length > 0) {
        medicamentos.forEach((med: any, index: number) => {
          doc.fontSize(12).text(`${index + 1}. ${med.nome} — ${med.dosagem}`)
          doc.fontSize(10).text(`Frequência: ${med.frequencia}`, { indent: 20 })
          if (med.via) doc.text(`Via: ${med.via}`, { indent: 20 })
          doc.moveDown(0.5)
        })
      } else {
        doc.fontSize(12).text('Nenhum medicamento listado.')
      }

      // Observations
      const observacoes = p.detalhes?.observacoes
      if (observacoes) {
        doc.moveDown()
        doc.fontSize(14).text('OBSERVAÇÕES / RECOMENDAÇÕES', { underline: true })
        doc.fontSize(11).text(observacoes)
      }

      // CID-10
      if (p.detalhes?.cid10) {
        doc.moveDown()
        doc.fontSize(12).text(`CID-10: ${p.detalhes.cid10}`)
      }

      // Signature block
      doc.moveDown(4)
      doc.fontSize(12).text('_____________________________________', { align: 'center' })
      doc.text(p.professionals?.nome || 'Assinatura do Profissional', { align: 'center' })
      if (p.professionals?.crm_coren) {
        doc.fontSize(10).text(`CRM/COREN: ${p.professionals.crm_coren}`, { align: 'center' })
      }

      doc.end()
    })
  } catch (error: any) {
    console.error('Erro ao gerar PDF de prescrição:', error)
    return NextResponse.json({ error: 'Erro ao gerar arquivo PDF' }, { status: 500 })
  }
}
