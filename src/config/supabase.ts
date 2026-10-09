export function normalizeSupabaseUrl(value: string | undefined): string {
  return (value ?? '')
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
}

export const supabaseConfig = {
  url: normalizeSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL),
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? '',
};

export const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

export const isGoogleConfigured = Boolean(supabaseConfig.googleWebClientId);
