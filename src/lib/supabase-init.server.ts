
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';
import type { Database } from './database.types';

if (!SUPABASE_URL) throw new Error('SUPABASE_URL is not set');
if (!SUPABASE_ANON_KEY) throw new Error('SUPABASE_ANON_KEY is not set');

// Create a server-side Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
