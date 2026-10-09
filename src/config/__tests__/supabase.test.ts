import { normalizeSupabaseUrl } from '../supabase';

describe('Supabase project URL', () => {
  it('removes a trailing REST path so the client uses the project URL', () => {
    expect(normalizeSupabaseUrl('https://example.supabase.co/rest/v1')).toBe('https://example.supabase.co');
    expect(normalizeSupabaseUrl('https://example.supabase.co/')).toBe('https://example.supabase.co');
  });
});
