const { createClient } = require('@supabase/supabase-js'); 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY); 
async function getTables() { 
  const s = await supabase.from('students').select('*').limit(1); 
  console.log('Students:', s.data); 
  const a = await supabase.from('attempts').select('*').limit(1); 
  console.log('Attempts:', a.data); 
} 
getTables();