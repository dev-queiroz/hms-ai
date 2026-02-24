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
    const { data: paciente, error: pacienteError } = await supabaseAdmin
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    if (pacienteError || !paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
    }

    const { data: triagens } = await supabaseAdmin
      .from('triagens')
      .select('*')
      .eq('patient_id', id)
      .order('data_hora', { ascending: false })

    const { data: prontuario } = await supabaseAdmin
      .from('prontuarios')
      .select('*')
      .eq('patient_id', id)
      .single()

    const doc = new PDFDocument({ margin: 50 })
    const chunks: Buffer[] = []

    return new Promise<NextResponse>((resolve) => {
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => {
        const result = Buffer.concat(chunks)
        resolve(new NextResponse(result, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=prontuario_${(paciente as any).id.slice(0, 8)}.pdf`,
          },
        }))
      })

      // Header
      doc.fontSize(20).text('PRONTUÁRIO ELETRÔNICO - HOSPITAL IA', { align: 'center' })
      doc.moveDown()
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, { align: 'right' })
      doc.moveDown()

      // Patient data
      const p = paciente as any
      doc.fontSize(14).text('DADOS DO PACIENTE', { underline: true })
      doc.fontSize(12).text(`Nome: ${p.nome}`)
      doc.text(`CPF: ${p.cpf}`)
      doc.text(`Data de Nascimento: ${new Date(p.data_nasc).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`)
      doc.text(`SUS: ${p.sus_number}`)
      doc.text(`Endereço: ${p.endereco || 'Não informado'}`)
      doc.text(`Contato: ${p.contato || 'Não informado'}`)
      doc.moveDown()

      // Triagens
      const triagensList = triagens || []
      if (triagensList.length > 0) {
        doc.fontSize(14).text('HISTÓRICO DE TRIAGENS', { underline: true })
        triagensList.forEach((t: any) => {
          doc.fontSize(11).text(`${new Date(t.data_hora).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} - Risco: ${t.classificacao_risco || 'N/A'}`)
          doc.fontSize(10).text(`Sintomas: ${t.sintomas || 'Não informado'}`, { indent: 20 })
          const sv = t.sinais_vitais as any
          if (sv) {
            const pa = sv.pressao_arterial ? `PA ${sv.pressao_arterial}` : ''
            const temp = sv.temperatura ? `T ${sv.temperatura}ºC` : ''
            const fc = sv.frequencia_cardiaca ? `FC ${sv.frequencia_cardiaca}bpm` : ''
            const vitals = [pa, temp, fc].filter(Boolean).join(', ')
            if (vitals) doc.text(`Sinais Vitais: ${vitals}`, { indent: 20 })
          }
          doc.moveDown(0.5)
        })
        doc.moveDown()
      }

      // Clinical timeline
      const historyRaw = (prontuario as any)?.history
      const historyArray = Array.isArray(historyRaw) ? historyRaw : (historyRaw ? [historyRaw] : [])
      if (historyArray.length > 0) {
        doc.fontSize(14).text('EVOLUÇÃO CLÍNICA', { underline: true })
        historyArray.forEach((n: any) => {
          doc.fontSize(11).text(`${n.data ? new Date(n.data).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Sem data'} - ${n.profissional || 'Profissional'}`)
          doc.fontSize(10).text(n.descricao || n.observacoes || '', { indent: 20 })
          doc.moveDown(0.5)
        })
      }

      doc.end()
    })
  } catch (error: any) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json({ error: 'Erro ao gerar arquivo PDF' }, { status: 500 })
  }
}
