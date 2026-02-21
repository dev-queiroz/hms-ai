const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('--- Column Types for table "patients" ---');
  const { data: cols, error: colErr } = await supabase
    .from('patients')
    .select('*')
    .limit(1);

  if (colErr) {
    console.error('Error fetching data:', colErr);
  } else {
    console.log('Sample Data:', JSON.stringify(cols, null, 2));
  }

  // We can try to use RPC or a sneaky select to guess types
  // But the best is to use the PostgREST /rest/v1/?apikey=... which I already saw in schema.json
}

checkSchema();
