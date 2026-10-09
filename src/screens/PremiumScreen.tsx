import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { premiumMode } from '../features/entitlements';
import { colors, radius, spacing, type } from '../theme';
import type { PremiumScreenProps } from '../types/navigation';

const INCLUDED = [
  'Scanning stays free.',
  'Ingredient explanations stay free.',
  'Nutrition, listed allergens, and NOVA stay free.',
];

export function PremiumScreen(_props: PremiumScreenProps) {
  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Make smarter food choices with IngreCheck Premium</Text>
        <Text style={styles.body}>
          Proposed test prices, not final: ₹99 monthly or ₹699 yearly. There is no checkout in this version.
        </Text>
        {premiumMode === 'demo' ? (
          <Text style={styles.demo}>Demo access is on for testing. This is not a paid subscription.</Text>
        ) : null}
        <View style={styles.card}>
          <Text style={styles.heading}>What stays free</Text>
          {INCLUDED.map((line) => (
            <Text key={line} style={styles.body}>
              {line}
            </Text>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.heading}>Proposed Premium tool</Text>
          <Text style={styles.body}>Extended scan history beyond the latest 50 items.</Text>
        </View>
        <Button label="Subscribe" disabled onPress={() => undefined} />
        <Text style={styles.caption}>Checkout is not available in this version.</Text>
        <Button label="Restore purchases" disabled onPress={() => undefined} variant="secondary" />
        <Text style={styles.caption}>Restore will be available when store billing is added.</Text>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  back: { ...type.label, color: colors.primary, minHeight: 44 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  title: { ...type.title, color: colors.primary },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heading: { ...type.heading, color: colors.text },
  body: { ...type.body, color: colors.secondary },
  caption: { ...type.caption, color: colors.secondary },
  demo: { ...type.body, color: colors.warning },
});
