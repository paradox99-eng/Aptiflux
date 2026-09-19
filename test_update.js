const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [k, ...v] = line.split('=');
  if(k) acc[k.trim()] = v.join('=').trim();
  return acc;
}, {});
fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/students?email=eq.parthibdutta947@gmail.com`, {
  method: 'PATCH',
  headers: {
    'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({ streak_count: 7 })
}).then(res => res.json()).then(console.log);
