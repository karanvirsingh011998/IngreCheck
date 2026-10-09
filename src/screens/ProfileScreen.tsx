import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { premiumMode, showsPremiumScreen } from '../features/entitlements';
import {
  deleteOwnAccount,
  loadAccountCounts,
  loadDisplayName,
  saveDisplayName,
  type AccountCounts,
} from '../services/cloud';
import { colors, radius, spacing, type } from '../theme';
import type { AuthProviderName } from '../types/auth';
import type { ProfileScreenProps } from '../types/navigation';

const PROVIDER_LABELS: Record<AuthProviderName, string> = {
  email: 'Email',
  google: 'Google',
  apple: 'Apple',
  unknown: 'Account',
};

const COUNT_CARDS: { key: keyof AccountCounts; label: string; route: 'ScanHistory' | 'Favorites' | 'Preferences' }[] = [
  { key: 'scans', label: 'Scan history', route: 'ScanHistory' },
  { key: 'favorites', label: 'Favorites', route: 'Favorites' },
  { key: 'preferences', label: 'Ingredient preferences', route: 'Preferences' },
];

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { profile, initializing, configured, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const [busy, setBusy] = useState<'google' | 'apple' | 'name' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [counts, setCounts] = useState<AccountCounts | null>(null);
  const [countsNote, setCountsNote] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!profile) {
        return;
      }
      setDisplayName(profile.displayName ?? '');
      setCounts(null);
      setCountsNote(null);
      void loadDisplayName().then((result) => {
        if (result.ok && result.data) {
          setDisplayName(result.data);
        }
      });
      void loadAccountCounts().then((result) => {
        if (!result.ok) {
          setCountsNote(result.message);
          return;
        }
        setCounts(result.data);
      });
    }, [profile]),
  );

  async function run(provider: 'google' | 'apple') {
    setBusy(provider);
    setError(null);
    const result = provider === 'google' ? await signInWithGoogle() : await signInWithApple();
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
    }
  }

  async function saveName() {
    setBusy('name');
    setError(null);
    const result = await saveDisplayName(displayName);
    setBusy(null);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDisplayName(result.data);
  }

  function confirmSignOut() {
    Alert.alert('Sign out?', 'You can keep scanning without an account.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  function confirmDelete() {
    Alert.alert(
      'Delete account?',
      'This removes your profile, scan history, favorites, and ingredient preferences.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setBusy('delete');
              setError(null);
              const result = await deleteOwnAccount();
              if (!result.ok) {
                setBusy(null);
                setError(result.message);
                return;
              }
              await signOut();
              setBusy(null);
            })();
          },
        },
      ],
    );
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Profile</Text>
        {initializing ? <ActivityIndicator color={colors.primary} /> : null}
        {!initializing && profile ? (
          <View style={styles.stack}>
            <View style={styles.card}>
              {profile.email ? <Text style={styles.body}>{profile.email}</Text> : null}
              <Text style={styles.caption}>Signed in with {PROVIDER_LABELS[profile.provider]}</Text>
              <View style={styles.counts}>
                {COUNT_CARDS.map((card) => (
                  <Pressable
                    key={card.key}
                    accessibilityRole="button"
                    onPress={() => navigation.navigate(card.route)}
                    style={styles.countCard}
                  >
                    <Text style={styles.countValue}>
                      {counts ? String(counts[card.key]) : countsNote ? 'Not available' : '…'}
                    </Text>
                    <Text style={styles.caption}>{card.label}</Text>
                  </Pressable>
                ))}
              </View>
              {countsNote ? <Text style={styles.error}>{countsNote}</Text> : null}
              <TextInput
                accessibilityLabel="Display name"
                onChangeText={setDisplayName}
                placeholder="Display name"
                placeholderTextColor={colors.secondary}
                style={styles.input}
                value={displayName}
              />
              <Button label="Save name" loading={busy === 'name'} onPress={() => void saveName()} />
            </View>
            {showsPremiumScreen(premiumMode) ? (
              <Button label="Premium" onPress={() => navigation.navigate('Premium')} variant="secondary" />
            ) : null}
            <Button label="Sign out" onPress={confirmSignOut} variant="ghost" />
            <Button label="Delete account" loading={busy === 'delete'} onPress={confirmDelete} variant="ghost" />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Privacy draft" onPress={() => navigation.navigate('Privacy')} variant="ghost" />
            <Button label="Terms draft" onPress={() => navigation.navigate('Terms')} variant="ghost" />
          </View>
        ) : null}
        {!initializing && !profile ? (
          <View style={styles.stack}>
            <Text style={styles.body}>
              An account is optional. Scanning, ingredients, nutrition, allergens, and NOVA stay available without one.
              Sign in to save history, favorites, and ingredient preferences.
            </Text>
            {!configured ? (
              <Text style={styles.caption}>
                Profile sign-in is not configured yet. Add your Supabase URL and anon key. Scanning still works.
              </Text>
            ) : (
              <>
                <Button label="Create account" onPress={() => navigation.navigate('SignUp')} />
                <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} variant="secondary" />
                <Button
                  label="Continue with Google"
                  loading={busy === 'google'}
                  onPress={() => void run('google')}
                  variant="secondary"
                />
                <Button
                  label="Continue with Apple"
                  loading={busy === 'apple'}
                  onPress={() => void run('apple')}
                  variant="secondary"
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
              </>
            )}
            <Button label="Privacy draft" onPress={() => navigation.navigate('Privacy')} variant="ghost" />
            <Button label="Terms draft" onPress={() => navigation.navigate('Terms')} variant="ghost" />
          </View>
        ) : null}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  title: {
    ...type.display,
    color: colors.primary,
  },
  stack: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  input: {
    ...type.body,
    color: colors.text,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  body: {
    ...type.body,
    color: colors.secondary,
  },
  counts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  countCard: {
    flexGrow: 1,
    minWidth: 96,
    backgroundColor: colors.mint,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  countValue: {
    ...type.title,
    color: colors.primary,
  },
  caption: {
    ...type.caption,
    color: colors.secondary,
  },
  error: {
    ...type.caption,
    color: colors.error,
  },
});
