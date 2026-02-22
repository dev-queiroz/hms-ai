import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const PASSWORD = 'Senha123!'

async function seed() {
  console.log('🚀 Iniciando repovoamento do banco de dados...')

  // 1. Unidades de Saúde
  console.log('--- Criando Unidades de Saúde ---')
  const { data: unidades, error: uError } = await supabase.from('unidades_saude').insert([
    { nome: 'Hospital Regional Central', tipo: 'Hospital', endereco: 'Av. Principal, 100 - Centro', contato: '(11) 4002-8922' },
    { nome: 'UBS Jardim Norte', tipo: 'UBS', endereco: 'Rua das Flores, 50 - Jd. Norte', contato: '(11) 4002-8923' },
    { nome: 'UPA Noroeste', tipo: 'UPA', endereco: 'Via Expressa, S/N - Noroeste', contato: '(11) 4002-8924' }
  ]).select()

  if (uError) throw uError
  const [hospCentral, ubsNorte, upaNoroeste] = unidades

  // 2. Profissionais (Auth + DB)
  console.log('--- Criando Profissionais e Contas de Acesso ---')
  const profsData = [
    { email: 'admin@hospital.com', nome: 'Dr. Ricardo Admin', role: 'admin', cargo: 'Diretor Clínico', crm: '99999-SP', unit: hospCentral.id },
    { email: 'medico1@hospital.com', nome: 'Dra. Ana Silva', role: 'professional', cargo: 'Médica Plantonista', crm: '12345-SP', unit: hospCentral.id, esp: 'Clínica Geral' },
    { email: 'medico2@hospital.com', nome: 'Dr. Marcos Oliveira', role: 'professional', cargo: 'Médico Intensivista', crm: '54321-SP', unit: upaNoroeste.id, esp: 'Infectologia' },
    { email: 'enfermeiro1@hospital.com', nome: 'Juliana Costa', role: 'professional', cargo: 'Enfermeira Chefe', crm: 'COREN-6789', unit: hospCentral.id },
    { email: 'enfermeiro2@hospital.com', nome: 'Paulo Santos', role: 'professional', cargo: 'Enfermeiro Assistencial', crm: 'COREN-9876', unit: ubsNorte.id }
  ]

  const createdProfs = []

  for (const p of profsData) {
    // Cleanup existing user if any
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existing = existingUsers.users.find(u => u.email === p.email)
    if (existing) {
      console.log(`--- Removendo usuário existente: ${p.email} ---`)
      await supabase.auth.admin.deleteUser(existing.id)
      // Also delete from professionals just in case cascade didn't catch it or RLS blocked it
      await supabase.from('professionals').delete().eq('user_id', existing.id)
    }

    const { data: authUser, error: aError } = await supabase.auth.admin.createUser({
      email: p.email,
      password: PASSWORD,
      email_confirm: true
    })

    if (aError) {
      console.warn(`Aviso: Erro ao criar auth para ${p.email}: ${aError.message}`)
      continue
    }

    const { data: prof, error: pError } = await supabase.from('professionals').insert({
      user_id: authUser.user.id,
      id: authUser.user.id, // Primary Key surrogate fallback
      nome: p.nome,
      role: p.role,
      cargo: p.cargo,
      crm_coren: p.crm,
      unidade_saude_id: p.unit,
      especializacao: p.esp || null
    }).select().single()

    if (pError) throw pError
    createdProfs.push(prof)
  }

  // 3. Pacientes
  console.log('--- Criando Pacientes ---')
  const { data: patients, error: patError } = await supabase.from('patients').insert([
    { nome: 'João da Silva', cpf: '123.456.789-00', sus_number: '700000000000001', data_nasc: '1985-05-20', endereco: 'Rua A, 1', contato: '(11) 91111-1111' },
    { nome: 'Maria Souza', cpf: '234.567.890-11', sus_number: '700000000000002', data_nasc: '1992-08-15', endereco: 'Rua B, 2', contato: '(11) 92222-2222' },
    { nome: 'Carlos Eduardo', cpf: '345.678.901-22', sus_number: '700000000000003', data_nasc: '1970-12-10', endereco: 'Av. C, 3', contato: '(11) 93333-3333' },
    { nome: 'Ana Paula Rocha', cpf: '456.789.012-33', sus_number: '700000000000004', data_nasc: '1998-03-25', endereco: 'Rua D, 4', contato: '(11) 94444-4444' },
    { nome: 'Pedro Henrique', cpf: '567.890.123-44', sus_number: '700000000000005', data_nasc: '2010-01-05', endereco: 'Travessa E, 5', contato: '(11) 95555-5555' }
  ]).select()

  if (patError) throw patError

  // 4. Triagens
  console.log('--- Criando Histórico: Triagens ---')
  const triagens = []
  for (let i = 0; i < patients.length; i++) {
    const { data: triagem } = await supabase.from('triagens').insert({
      patient_id: patients[i].id,
      professional_id: createdProfs.find(p => p.role === 'professional' && p.unidade_saude_id === hospCentral.id)?.id || createdProfs[3].id,
      sintomas: 'Febre persistente e dor no corpo há 2 dias.',
      classificacao_risco: i % 2 === 0 ? 'amarelo' : 'verde',
      sinais_vitais: { temperatura: 38.5, frequencia_cardiaca: 90, pressao_arterial: '12/8' },
      data_hora: new Date(Date.now() - 3600000 * (i + 1)).toISOString()
    }).select().single()
    triagens.push(triagem)
  }

  // 5. Agendamentos (Consultas)
  console.log('--- Criando Histórico: Consultas ---')
  for (let i = 0; i < patients.length; i++) {
    await supabase.from('agendamentos').insert({
      patient_id: patients[i].id,
      professional_id: createdProfs.find(p => p.role === 'professional' && p.unidade_saude_id === hospCentral.id)?.id || createdProfs[1].id,
      id_unidades_saude: hospCentral.id,
      tipo: 'Consulta',
      prioridade: false,
      data_hora: new Date(Date.now() - 1800000 * (i + 1)).toISOString()
    })
  }

  // 6. Prescrições
  console.log('--- Criando Histórico: Prescrições ---')
  for (let i = 0; i < 3; i++) {
    await supabase.from('prescricoes').insert({
      patient_id: patients[i].id,
      professional_id: createdProfs[1].id,
      detalhes: {
        medicamentos: [
          { nome: 'Paracetamol 500mg', posologia: '1 comprimido a cada 6h' },
          { nome: 'Dipirona 1g', posologia: '1 comprimido se dor' }
        ],
        observacoes: 'Repouso e hidratação.'
      },
      data: new Date().toISOString()
    })
  }

  // 7. Prontuários (History)
  console.log('--- Criando Prontuários ---')
  for (const p of patients) {
    await supabase.from('prontuarios').insert({
      patient_id: p.id,
      history: [
        {
          data: new Date(Date.now() - 86400000).toISOString(),
          tipo: 'Consulta',
          profissional: 'Dra. Ana Silva',
          observacoes: 'Paciente apresenta sintomas leves, iniciado tratamento sintomático.',
          cid10: 'R50.9'
        }
      ],
      updated_at: new Date().toISOString()
    })
  }

  console.log('✅ Repovoamento concluído com sucesso!')
}

seed().catch(err => {
  console.error('❌ Erro durante o seeding:', err)
  process.exit(1)
})
