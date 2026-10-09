import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppShell } from '../components/AppShell';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { dashboardDetail, dashboardLinks, openAppDestination } from '../navigation/appLinks';
import { colors, radius, spacing, type } from '../theme';
import type { RootStackParamList } from '../types/navigation';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const name = profile?.displayName?.trim() || profile?.email || 'there';

  if (profile) {
    return (
      <AppShell>
        <ScrollView contentContainerStyle={styles.dashboard}>
          <Text style={styles.headline}>Dashboard</Text>
          <Text style={styles.description}>Hello, {name}.</Text>
          <View style={styles.grid}>
            {dashboardLinks.map((link) => (
              <Pressable
                key={link.destination}
                accessibilityRole="button"
                onPress={() => openAppDestination(navigation, link.destination)}
                style={styles.tile}
              >
                <Text style={styles.tileTitle}>{link.label}</Text>
                <Text style={styles.tileDetail}>{dashboardDetail(link.destination)}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </AppShell>
    );
  }

  return (
    <AppShell>
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
          <Button label="Log In" onPress={() => navigation.navigate('SignIn')} variant="secondary" />
          <Button label="Sign Up" onPress={() => navigation.navigate('SignUp')} variant="secondary" />
          <Button label="Compare products" onPress={() => navigation.navigate('Compare')} variant="ghost" />
        </View>
        <Text style={styles.note}>
          Product information may be incomplete or different from the package. Check the label, especially if you have
          an allergy.
        </Text>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
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
  note: {
    ...type.caption,
    color: colors.secondary,
    marginTop: spacing.lg,
  },
  dashboard: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    width: '100%',
    minHeight: 88,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tileTitle: {
    ...type.label,
    color: colors.primary,
  },
  tileDetail: {
    ...type.caption,
    color: colors.secondary,
  },
});
