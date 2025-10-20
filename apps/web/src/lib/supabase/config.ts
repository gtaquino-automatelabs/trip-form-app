export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceKey: process.env.SUPABASE_SERVICE_KEY,
} as const;

export const validateSupabaseConfig = () => {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error(
      'Missing required Supabase environment variables. Please check your .env.local file.'
    );
  }
  return true;
};