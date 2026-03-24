import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://srxaxvhteicdoxivhhua.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_NWMash_zLa5cWd59DZi1CA_XPV0oK-4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
