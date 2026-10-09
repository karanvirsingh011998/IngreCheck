import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppShell } from '../components/AppShell';
import { APP_VERSION } from '../config/appInfo';
import { HELP_SECTIONS } from '../content/help';
import { colors, spacing, type } from '../theme';

export function HelpScreen() {
  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Help</Text>
        <Text style={styles.caption}>IngreCheck {APP_VERSION}</Text>
        {HELP_SECTIONS.map((section) => (
          <View key={section.heading} style={styles.block}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  title: { ...type.display, color: colors.primary },
  heading: { ...type.heading, color: colors.text },
  body: { ...type.body, color: colors.secondary },
  caption: { ...type.caption, color: colors.secondary },
  block: { gap: spacing.sm },
});
