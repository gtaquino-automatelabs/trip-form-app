import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';
import { supabaseConfig, validateSupabaseConfig } from './config';

export const createClient = () => {
  validateSupabaseConfig();
  return createSupabaseBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
};

// Export a singleton instance for use in client components
export const supabase = createClient();