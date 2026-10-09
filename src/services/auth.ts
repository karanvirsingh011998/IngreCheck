import type { User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { isGoogleConfigured, supabaseConfig } from '../config/supabase';
import type { AuthActionResult, AuthProfile, AuthProviderName } from '../types/auth';
import { mapAuthError } from '../utils/authValidation';
import { supabase } from './supabase';

const NOT_CONFIGURED = 'Profile sign-in is not configured yet. Scanning still works.';

function readMeta(metadata: unknown, key: string): string | null {
  if (typeof metadata !== 'object' || metadata === null || !(key in metadata)) {
    return null;
  }
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function providerFrom(user: User): AuthProviderName {
  const provider = user.app_metadata?.provider;
  if (provider === 'email' || provider === 'google' || provider === 'apple') {
    return provider;
  }
  return 'unknown';
}

export function profileFromUser(user: User): AuthProfile {
  return {
    id: user.id,
    email: user.email ?? null,
    displayName: readMeta(user.user_metadata, 'full_name') ?? readMeta(user.user_metadata, 'name'),
    provider: providerFrom(user),
  };
}

function readParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const query =
    queryIndex >= 0 ? url.slice(queryIndex + 1, hashIndex >= 0 && hashIndex > queryIndex ? hashIndex : undefined) : '';
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  for (const pair of `${query}&${hash}`.split('&')) {
    if (!pair) {
      continue;
    }
    const separator = pair.indexOf('=');
    const rawKey = separator >= 0 ? pair.slice(0, separator) : pair;
    const rawValue = separator >= 0 ? pair.slice(separator + 1) : '';
    params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, ' '));
  }
  return params;
}

export async function createSessionFromUrl(url: string): Promise<'recovery' | 'session' | 'none'> {
  if (!supabase) {
    return 'none';
  }
  const params = readParams(url);
  if (params.error_description || params.error) {
    throw new Error(params.error_description || params.error);
  }
  const isRecovery = url.includes('auth/reset') || params.type === 'recovery';
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) {
      throw error;
    }
    return isRecovery ? 'recovery' : 'session';
  }
  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) {
      throw error;
    }
    return isRecovery ? 'recovery' : 'session';
  }
  return 'none';
}

export async function signInWithEmail(email: string, password: string): Promise<AuthActionResult> {
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED };
  }
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    return { ok: false, message: mapAuthError(error.message) };
  }
  return { ok: true };
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthActionResult> {
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED };
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: Linking.createURL('auth/callback') },
  });
  if (error) {
    return { ok: false, message: mapAuthError(error.message) };
  }
  return { ok: true, needsEmailConfirmation: !data.session };
}

export async function sendPasswordReset(email: string): Promise<AuthActionResult> {
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: Linking.createURL('auth/reset'),
  });
  if (error) {
    return { ok: false, message: mapAuthError(error.message) };
  }
  return { ok: true };
}

export async function updatePassword(password: string): Promise<AuthActionResult> {
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED };
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, message: mapAuthError(error.message) };
  }
  return { ok: true };
}

function errorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = error.code;
    if (typeof code === 'string' || typeof code === 'number') {
      return String(code);
    }
  }
  return null;
}

export async function signInWithGoogle(): Promise<AuthActionResult> {
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED };
  }
  if (!isGoogleConfigured) {
    return { ok: false, message: 'Google sign-in is not configured yet.' };
  }
  try {
    const google = await import('@react-native-google-signin/google-signin');
    google.GoogleSignin.configure({
      webClientId: supabaseConfig.googleWebClientId,
      ...(supabaseConfig.googleIosClientId ? { iosClientId: supabaseConfig.googleIosClientId } : {}),
    });
    if (Platform.OS === 'android') {
      await google.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }
    const response = await google.GoogleSignin.signIn();
    if (response.type === 'cancelled') {
      return { ok: false, message: 'Google sign-in was cancelled.' };
    }
    if (!response.data.idToken) {
      return { ok: false, message: 'Google did not return a sign-in token.' };
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.data.idToken,
    });
    if (error) {
      return { ok: false, message: mapAuthError(error.message) };
    }
    return { ok: true };
  } catch (error) {
    const code = errorCode(error);
    if (code === 'SIGN_IN_CANCELLED' || code === '-5') {
      return { ok: false, message: 'Google sign-in was cancelled.' };
    }
    const message = error instanceof Error ? error.message : 'Google sign-in failed.';
    return { ok: false, message: mapAuthError(message) };
  }
}

function randomNonce(length = 32): string {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._';
  const bytes = Crypto.getRandomBytes(length);
  let nonce = '';
  for (const byte of bytes) {
    nonce += charset[byte % charset.length];
  }
  return nonce;
}

async function signInWithAppleNative(): Promise<AuthActionResult> {
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED };
  }
  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    return { ok: false, message: 'Apple sign-in is not available on this device.' };
  }
  const rawNonce = randomNonce();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  if (!credential.identityToken) {
    return { ok: false, message: 'Apple did not return a sign-in token.' };
  }
  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) {
    return { ok: false, message: mapAuthError(error.message) };
  }
  const givenName = credential.fullName?.givenName ?? undefined;
  const familyName = credential.fullName?.familyName ?? undefined;
  const fullName = [givenName, familyName].filter((part) => Boolean(part)).join(' ');
  if (fullName) {
    await supabase.auth.updateUser({
      data: { full_name: fullName, given_name: givenName, family_name: familyName },
    });
  }
  return { ok: true };
}

async function signInWithAppleBrowser(): Promise<AuthActionResult> {
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED };
  }
  const redirectTo = Linking.createURL('auth/callback');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) {
    return { ok: false, message: mapAuthError(error?.message ?? 'Apple sign-in could not start.') };
  }
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') {
    return { ok: false, message: 'Apple sign-in was cancelled.' };
  }
  await createSessionFromUrl(result.url);
  return { ok: true };
}

export async function signInWithApple(): Promise<AuthActionResult> {
  if (!supabase) {
    return { ok: false, message: NOT_CONFIGURED };
  }
  try {
    if (Platform.OS === 'ios') {
      return await signInWithAppleNative();
    }
    return await signInWithAppleBrowser();
  } catch (error) {
    if (errorCode(error) === 'ERR_REQUEST_CANCELED') {
      return { ok: false, message: 'Apple sign-in was cancelled.' };
    }
    const message = error instanceof Error ? error.message : 'Apple sign-in failed.';
    return { ok: false, message: mapAuthError(message) };
  }
}

export async function signOutAccount(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  try {
    const google = await import('@react-native-google-signin/google-signin');
    await google.GoogleSignin.signOut();
  } catch {
    // Google sign-in is optional and may be absent from this build.
  }
}
