import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import { completeOnboarding } from '../services/onboarding';
import { colors, spacing, type } from '../theme';
import type { OnboardingScreenProps } from '../types/navigation';

const STEPS = [
  {
    title: 'Scan ingredients. Know instantly.',
    body: 'IngreCheck lets you scan a packaged food barcode and read the ingredient and nutrition details that are available for that product.',
  },
  {
    title: 'Understand your food',
    body: 'A product page can show ingredients, nutrition values, declared allergens and traces, and a NOVA processing group when the record includes one. Missing details stay missing.',
  },
  {
    title: 'Get started',
    body: 'You can scan without an account. Product records can be incomplete or different from the package in your hand. This app does not guarantee food safety.',
  },
];

export function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const page = STEPS[step];
  const last = step === STEPS.length - 1;

  async function finish(destination: 'Home') {
    setSaving(true);
    try {
      await completeOnboarding();
    } catch {
      // Still leave the introduction. The scanner should remain reachable.
    }
    navigation.reset({ index: 0, routes: [{ name: destination }] });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" onPress={() => void finish('Home')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        <BrandMark size={72} />
        <Text style={styles.kicker}>IngreCheck</Text>
        <Text style={styles.title}>{page.title}</Text>
        <Text style={styles.body}>{page.body}</Text>
        <Text style={styles.caption}>
          Step {step + 1} of {STEPS.length}
        </Text>
      </View>
      <View style={styles.actions}>
        {last ? (
          <Button label="Continue" loading={saving} onPress={() => void finish('Home')} />
        ) : (
          <Button label="Continue" onPress={() => setStep((current) => current + 1)} />
        )}
        <Button label="Privacy and terms" onPress={() => navigation.navigate('Privacy')} variant="ghost" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  top: { alignItems: 'flex-end', paddingTop: spacing.sm },
  skip: { ...type.label, color: colors.primary, minHeight: 44 },
  content: { flex: 1, justifyContent: 'center', gap: spacing.md },
  kicker: { ...type.label, color: colors.fresh },
  title: { ...type.title, color: colors.primary },
  body: { ...type.body, color: colors.secondary },
  caption: { ...type.caption, color: colors.secondary },
  actions: { gap: spacing.md, paddingBottom: spacing.xl },
});
