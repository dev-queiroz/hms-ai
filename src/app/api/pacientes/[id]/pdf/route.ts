import { NextRequest, NextResponse } from 'next/server'
import { pacienteService } from '@/lib/services/paciente.service'
import PDFDocument from 'pdfkit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  const { id } = resolvedParams

  try {
    const paciente = await pacienteService.getPacienteById(id)
    if (!paciente) return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })

    const triagens = await pacienteService.getTriagensByPatientId(id)
    const prontuario = await pacienteService.getProntuarioByPatientId(id)

    const doc = new PDFDocument({ margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    
    return new Promise<NextResponse>((resolve) => {
      doc.on('end', () => {
        const result = Buffer.concat(chunks)
        resolve(new NextResponse(result, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=prontuario_${paciente.nome.replace(/\s+/g, '_')}.pdf`,
          },
        }))
      })

      // PDF Content
      doc.fontSize(20).text('PRONTUÁRIO ELETRÔNICO - HOSPITAL IA', { align: 'center' })
      doc.moveDown()
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'right' })
      doc.moveDown()

      doc.fontSize(14).text('DADOS DO PACIENTE', { underline: true })
      doc.fontSize(12).text(`Nome: ${paciente.nome}`)
      doc.text(`CPF: ${paciente.cpf}`)
      doc.text(`Data de Nascimento: ${new Date(paciente.data_nasc).toLocaleDateString('pt-BR')}`)
      doc.text(`SUS: ${paciente.sus_number}`)
      doc.text(`Endereço: ${paciente.endereco || 'Não informado'}`)
      doc.text(`Contato: ${paciente.contato || 'Não informado'}`)
      doc.moveDown()

      if (triagens.length > 0) {
        doc.fontSize(14).text('HISTÓRICO DE TRIAGENS', { underline: true })
        triagens.forEach(t => {
          doc.fontSize(11).text(`${new Date(t.data_hora).toLocaleString('pt-BR')} - Risco: ${t.classificacao_risco || 'N/A'}`)
          doc.fontSize(10).text(`Sintomas: ${t.sintomas}`, { indent: 20 })
          
          const sv = t.sinais_vitais as any
          if (sv) {
            const pa = sv.pressao_arterial ? `PA ${sv.pressao_arterial}` : ''
            const temp = sv.temperatura ? `T ${sv.temperatura}ºC` : ''
            const fc = sv.frequencia_cardiaca ? `FC ${sv.frequencia_cardiaca}bpm` : ''
            doc.text(`Sinais Vitais: ${[pa, temp, fc].filter(Boolean).join(', ')}`, { indent: 20 })
          }
          doc.moveDown(0.5)
        })
        doc.moveDown()
      }

      const historyRaw = prontuario?.history
      const notas = Array.isArray(historyRaw) ? historyRaw : (historyRaw ? [historyRaw] : [])
      
      if (notas.length > 0) {
        doc.fontSize(14).text('EVOLUÇÃO CLÍNICA', { underline: true })
        notas.forEach((n: any) => {
          doc.fontSize(11).text(`${n.data ? new Date(n.data).toLocaleString('pt-BR') : 'Sem data'} - ${n.profissional || 'Profissional'}`)
          doc.fontSize(10).text(n.descricao || '', { indent: 20 })
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
