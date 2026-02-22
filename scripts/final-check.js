const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { count, error } = await supabase.from('professionals').select('*', { count: 'exact', head: true });
  console.log('Total Professionals:', count);
  
  const { data } = await supabase.from('unidades_saude').select('nome');
  console.log('Unidades:', data.map(u => u.nome).join(', '));
}

check();
