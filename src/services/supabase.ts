import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve from localStorage first (for in-browser configuration), then fall back to env vars
export const getSupabaseCredentials = () => {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('stockwise_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('stockwise_supabase_key') || '' : '';
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  return {
    url: localUrl.trim() || envUrl.trim(),
    key: localKey.trim() || envKey.trim(),
    source: localUrl.trim() ? 'browser_storage' : envUrl.trim() ? 'environment' : 'none',
  };
};

export const isSupabaseConfigured = (): boolean => {
  const { url, key } = getSupabaseCredentials();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('placeholder') &&
    !url.includes('your-project')
  );
};

export const createCustomSupabaseClient = (url: string, key: string): SupabaseClient => {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

const credentials = getSupabaseCredentials();

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createCustomSupabaseClient(credentials.url, credentials.key)
  : null;
