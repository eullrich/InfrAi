
// src/lib/supabase-init.server.ts
// This file is only for server-side Supabase initialization
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private';

// Create a server-side Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
