export type AuthProviderName = 'email' | 'google' | 'apple' | 'unknown';

export type AuthProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  provider: AuthProviderName;
};

export type AuthActionResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; message: string };
