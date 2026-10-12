import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { REPORT_ISSUES, REPORT_NOT_SENT } from '../content/help';
import { colors, radius, spacing, type } from '../theme';
import type { ReportProductScreenProps } from '../types/navigation';

export function ReportProductScreen({ route }: ReportProductScreenProps) {
  const { productName } = route.params;
  const [selected, setSelected] = useState<string | null>(null);
  const [noted, setNoted] = useState(false);

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Report incorrect information</Text>
        <Text style={styles.body}>
          {productName} may include incorrect details. IngreCheck does not store a report and does not send one when you
          choose an issue.
        </Text>
        {REPORT_ISSUES.map((issue) => {
          const active = selected === issue;
          return (
            <Pressable
              key={issue}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                setSelected(issue);
                setNoted(false);
              }}
              style={[styles.choice, active && styles.choiceSelected]}
            >
              <Text style={styles.choiceText}>{issue}</Text>
            </Pressable>
          );
        })}
        <Button
          disabled={!selected}
          label="Review what happens"
          onPress={() => setNoted(true)}
        />
        {noted ? (
          <View style={styles.note}>
            <Text style={styles.body}>{REPORT_NOT_SENT}</Text>
            <Text style={styles.body}>The name of the product database is in the Privacy draft and the Terms draft.</Text>
          </View>
        ) : null}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  title: { ...type.display, color: colors.primary },
  body: { ...type.body, color: colors.secondary },
  choice: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
  },
  choiceSelected: { backgroundColor: colors.mint, borderColor: colors.fresh },
  choiceText: { ...type.body, color: colors.text },
  note: { gap: spacing.sm },
});
