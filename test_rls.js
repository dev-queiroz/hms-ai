const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const supabaseAnon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  // Test with admin key
  const { data: adminData, error: adminError } = await supabaseAdmin.from('professionals').select('*');
  console.log("Admin config (should bypass RLS) - count:", adminData?.length, "error:", adminError?.message);

  // Authenticate as a user and test with anon key (with token)
  if (adminData && adminData.length > 0) {
     const prof = adminData[0];
     // We can't easily sign in without password, but we can verify RLS by just reading anonymously first
     const { data: anonData, error: anonError } = await supabaseAnon.from('professionals').select('*');
     console.log("Anon config - count:", anonData?.length, "error:", anonError?.message);
  }
}
run();
