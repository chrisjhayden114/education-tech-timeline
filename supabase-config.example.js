// Shared (worldwide) comments via Supabase.
//
// Setup:
// 1. Create a free project at https://supabase.com
// 2. Dashboard → SQL → New query → paste and run supabase-schema.sql
// 3. Dashboard → Project Settings → API → copy Project URL and anon public key
// 4. Preferred for production: set Netlify env vars SUPABASE_URL and SUPABASE_ANON_KEY
//    (scripts/write-supabase-config.js writes supabase-config.js on each deploy)
// 5. Or for local testing only, fill these in and copy to supabase-config.js:
//
window.SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
window.SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';
