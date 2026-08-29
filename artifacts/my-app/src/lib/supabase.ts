// Supabase client for Aethelia.
//
// Uses ONLY frontend-safe env vars:
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//
// Never use service_role here — it must never reach the browser.
// If the env vars are missing or invalid the app stays alive and shows
// a graceful "auth not configured" state instead of crashing.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function readEnv(key: string): string | undefined {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : undefined;
}

export const SUPABASE_URL = readEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = readEnv('VITE_SUPABASE_ANON_KEY');

function isValidUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = Boolean(
  isValidUrl(SUPABASE_URL) &&
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY.length > 12,
);

export const SUPABASE_CONFIG_MESSAGE =
  'Supabase не настроен. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY через Replit Secrets или .env.local.';

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'x-client-info': 'aethelia-vite',
        },
      },
    })
  : null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(SUPABASE_CONFIG_MESSAGE);
  }
  return supabase;
}
