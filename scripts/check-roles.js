const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Checking Constraint Definitions ---');
  // Since we cannot run raw SQL via PostgREST easily, we try to use an RPC if possible,
  // or we just try to insert and catch error details.
  // Actually, I'll try to use the "POST /rest/v1/rpc/..." if there is a known one.
  // If not, I'll just try inserting a set of possible roles.

  const roles = [
    'ADMINISTRADOR_PRINCIPAL',
    'MEDICO',
    'ENFERMEIRO',
    'admin',
    'medico',
    'enfermeiro',
    'Administrador',
    'Médico',
    'Enfermeiro',
    'ADMIN',
    'PROFISSIONAL',
    'DOCTOR',
    'NURSE',
    'doctor',
    'nurse',
    'adm',
    'MED',
    'ENF',
    'med',
    'enf',
    'médico',
    'enfermeiro',
    'administrador',
    'profissional',
    'professional',
    'Recepcionista',
    'recepcionista'
  ];

  for (const role of roles) {
    const { error } = await supabase.from('professionals').insert({
      id: '00000000-0000-0000-0000-000000000001',
      nome: 'Test',
      crm_coren: '000',
      role: role
    });
    
    if (!error) {
      console.log(`✅ Role "${role}" IS allowed!`);
      // Cleanup
      await supabase.from('professionals').delete().eq('id', '00000000-0000-0000-0000-000000000001');
    } else {
      if (error.message.includes('check constraint')) {
        console.log(`❌ Role "${role}" is NOT allowed.`);
      } else {
        console.log(`⚠️ Role "${role}" failed with other error: ${error.message}`);
      }
    }
  }
}

check();
