import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, type } from '../theme';
import type { HomeScreenProps } from '../types/navigation';

export function HomeScreen({ navigation }: HomeScreenProps) {
  const { profile } = useAuth();
  const initial = profile?.displayName?.[0] ?? profile?.email?.[0] ?? 'P';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <View style={styles.spacer} />
        {profile ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={() => navigation.navigate('Profile')}
            style={styles.profile}
          >
            <Text style={styles.profileText}>{initial.toUpperCase()}</Text>
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BrandMark size={88} />
        <Text style={styles.wordmark}>IngreCheck</Text>
        <Text style={styles.tagline}>Scan ingredients. Know instantly.</Text>
        <Text style={styles.headline}>Know What's in Your Food.</Text>
        <Text style={styles.description}>
          Scan packaged food barcodes to explore ingredients, nutrition, allergens, and available processing
          information.
        </Text>
        <View style={styles.actions}>
          <Button label="Start Scan" onPress={() => navigation.navigate('Scanner')} />
          {profile ? null : (
            <>
              <Button label="Log In" onPress={() => navigation.navigate('SignIn')} variant="secondary" />
              <Button label="Sign Up" onPress={() => navigation.navigate('SignUp')} variant="secondary" />
            </>
          )}
          <Button label="Compare products" onPress={() => navigation.navigate('Compare')} variant="ghost" />
        </View>
        <Text style={styles.footer}>
          Product information may be incomplete or different from the package. Check the label, especially if you have
          an allergy.
        </Text>
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
  profile: {
    minHeight: 44,
    minWidth: 44,
    borderRadius: 22,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  profileText: {
    ...type.label,
    color: colors.primary,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  wordmark: {
    ...type.display,
    color: colors.primary,
    marginTop: spacing.lg,
  },
  tagline: {
    ...type.heading,
    color: colors.fresh,
  },
  headline: {
    ...type.title,
    color: colors.text,
  },
  description: {
    ...type.body,
    color: colors.secondary,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  footer: {
    ...type.caption,
    color: colors.secondary,
    marginTop: spacing.lg,
  },
});
