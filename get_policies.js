const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("URL:", supabaseUrl, "KEY:", supabaseKey ? "Present" : "Missing");

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('query_policies', {}).catch(e => ({error: e}));
  console.log("RPC query_policies:", data, error);
  
  // Alternative direct query using a known endpoint or service role hack:
  // Supabase JS client cannot query pg_policies directly unless exposed via a view or RPC.
  // Wait, I can just create a file in the app and run it there.
}
check();
