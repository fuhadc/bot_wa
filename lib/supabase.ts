import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // We don't throw here to avoid crashing the build if keys aren't set yet,
  // but we should log a warning.
  console.warn('Supabase environment variables are missing. Database persistence will fail.');
}

// Using createClient with the service role key for backend operations
// (By-passes RLS for administrative tasks like user management and logs)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseServiceKey || ''
);
