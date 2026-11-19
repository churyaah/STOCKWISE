import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://ndfseuemkcpqtihaplza.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_HNTEGhcJD_SYBX1cG3LvpQ_m2cioq-C';

// Retrieve from localStorage first, then environment variables, then project defaults.
export const getSupabaseCredentials = () => {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('stockwise_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('stockwise_supabase_key') || '' : '';
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const url = localUrl.trim() || envUrl.trim() || DEFAULT_SUPABASE_URL;
  const key = localKey.trim() || envKey.trim() || DEFAULT_SUPABASE_KEY;

  return {
    url,
    key,
    source: localUrl.trim() ? 'browser_storage' : envUrl.trim() ? 'environment' : 'project_default',
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
