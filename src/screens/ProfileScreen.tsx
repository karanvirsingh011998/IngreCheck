import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { premiumMode, showsPremiumScreen } from '../features/entitlements';
import { deleteOwnAccount, loadDisplayName, saveDisplayName } from '../services/cloud';
import { colors, radius, spacing, type } from '../theme';
import type { AuthProviderName } from '../types/auth';
import type { ProfileScreenProps } from '../types/navigation';

const PROVIDER_LABELS: Record<AuthProviderName, string> = {
  email: 'Email',
  google: 'Google',
  apple: 'Apple',
  unknown: 'Account',
};

const LINKS: { route: 'ScanHistory' | 'Favorites' | 'Preferences'; label: string }[] = [
  { route: 'ScanHistory', label: 'Scan history' },
  { route: 'Favorites', label: 'Favorites' },
  { route: 'Preferences', label: 'Ingredient preferences' },
];

export function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { profile, initializing, configured, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const [busy, setBusy] = useState<'google' | 'apple' | 'name' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!profile) {
        return;
      }
      setDisplayName(profile.displayName ?? '');
      void loadDisplayName().then((result) => {
        if (result.ok && result.data) {
          setDisplayName(result.data);
        }
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Profile</Text>
        {initializing ? <ActivityIndicator color={colors.primary} /> : null}
        {!initializing && profile ? (
          <View style={styles.stack}>
            <View style={styles.card}>
              {profile.email ? <Text style={styles.body}>{profile.email}</Text> : null}
              <Text style={styles.caption}>Signed in with {PROVIDER_LABELS[profile.provider]}</Text>
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
            {LINKS.map((link) => (
              <Button
                key={link.route}
                label={link.label}
                onPress={() => navigation.navigate(link.route)}
                variant="secondary"
              />
            ))}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  top: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  back: {
    ...type.label,
    color: colors.primary,
    minHeight: 44,
  },
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
  caption: {
    ...type.caption,
    color: colors.secondary,
  },
  error: {
    ...type.caption,
    color: colors.error,
  },
});
