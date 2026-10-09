import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import { Button } from './Button';

type Action = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
};

type Props = {
  title: string;
  body: string;
  tone?: 'neutral' | 'warning' | 'error';
  actions?: Action[];
};

export function StateMessage({ title, body, tone = 'neutral', actions = [] }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.card, tone === 'error' && styles.error, tone === 'warning' && styles.warning]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      {actions.map((action) => (
        <Button
          key={action.label}
          label={action.label}
          onPress={action.onPress}
          variant={action.variant ?? 'primary'}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  error: {
    borderColor: colors.error,
  },
  warning: {
    borderColor: colors.warning,
  },
  title: {
    ...type.heading,
    color: colors.text,
  },
  body: {
    ...type.body,
    color: colors.secondary,
  },
});
