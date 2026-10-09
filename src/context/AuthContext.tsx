import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { isSupabaseConfigured } from '../config/supabase';
import type { AuthProfile } from '../types/auth';
import {
  createSessionFromUrl,
  profileFromUser,
  sendPasswordReset,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signOutAccount,
  signUpWithEmail,
  updatePassword,
} from '../services/auth';
import { supabase } from '../services/supabase';

type AuthContextValue = {
  profile: AuthProfile | null;
  initializing: boolean;
  configured: boolean;
  passwordRecovery: boolean;
  clearPasswordRecovery: () => void;
  signInWithEmail: typeof signInWithEmail;
  signUpWithEmail: typeof signUpWithEmail;
  signInWithGoogle: typeof signInWithGoogle;
  signInWithApple: typeof signInWithApple;
  sendPasswordReset: typeof sendPasswordReset;
  updatePassword: typeof updatePassword;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [initializing, setInitializing] = useState(isSupabaseConfigured);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setInitializing(false);
      return undefined;
    }

    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) {
          return;
        }
        setProfile(data.session?.user ? profileFromUser(data.session.user) : null);
      })
      .catch(() => {
        if (active) {
          setProfile(null);
        }
      })
      .finally(() => {
        if (active) {
          setInitializing(false);
        }
      });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setProfile(session?.user ? profileFromUser(session.user) : null);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    const handleUrl = (url: string | null) => {
      if (!url || (!url.includes('auth/callback') && !url.includes('auth/reset') && !url.includes('access_token') && !url.includes('code='))) {
        return;
      }
      createSessionFromUrl(url)
        .then((kind) => {
          if (kind === 'recovery') {
            setPasswordRecovery(true);
          }
        })
        .catch(() => {
          setPasswordRecovery(false);
        });
    };

    Linking.getInitialURL().then(handleUrl).catch(() => undefined);
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });
    return () => subscription.remove();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      initializing,
      configured: isSupabaseConfigured,
      passwordRecovery,
      clearPasswordRecovery: () => setPasswordRecovery(false),
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
      sendPasswordReset,
      updatePassword,
      signOut: async () => {
        await signOutAccount();
        setProfile(null);
      },
    }),
    [initializing, passwordRecovery, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}
