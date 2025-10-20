import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseConfig, validateSupabaseConfig } from './config';

export const createClient = async () => {
  validateSupabaseConfig();
  const cookieStore = await cookies();

  return createSupabaseServerClient(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};

export const createServiceClient = async () => {
  validateSupabaseConfig();
  const cookieStore = await cookies();
  
  if (!supabaseConfig.serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
  }

  return createSupabaseServerClient(
    supabaseConfig.url,
    supabaseConfig.serviceKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};