import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { LEGAL_REVIEW_NOTE, PRIVACY_SECTIONS, TERMS_SECTIONS } from '../content/legal';
import { colors, spacing, type } from '../theme';
import type { PrivacyScreenProps, TermsScreenProps } from '../types/navigation';

type Props = {
  title: string;
  sections: { heading: string; body: string }[];
  onBack: () => void;
};

function LegalDocument({ title, sections, onBack }: Props) {
  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.note}>{LEGAL_REVIEW_NOTE}</Text>
        {sections.map((section) => (
          <View key={section.heading} style={styles.block}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </AppShell>
  );
}

export function PrivacyScreen({ navigation }: PrivacyScreenProps) {
  return <LegalDocument title="Privacy draft" sections={PRIVACY_SECTIONS} onBack={() => navigation.goBack()} />;
}

export function TermsScreen({ navigation }: TermsScreenProps) {
  return <LegalDocument title="Terms draft" sections={TERMS_SECTIONS} onBack={() => navigation.goBack()} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  back: { ...type.label, color: colors.primary, minHeight: 44 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  title: { ...type.display, color: colors.primary },
  note: { ...type.body, color: colors.warning },
  block: { gap: spacing.xs },
  heading: { ...type.heading, color: colors.text },
  body: { ...type.body, color: colors.secondary },
});
