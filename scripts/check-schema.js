const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('--- Fetching Column Details via PostgREST ---');
  // We can try to guess by selecting one row if it exists
  const { data, error } = await supabase.from('professionals').select('*').limit(1);
  if (error) {
    console.error('Error selecting:', error.message);
  } else {
    console.log('Existing Professional Row:', JSON.stringify(data, null, 2));
  }
}

check();
