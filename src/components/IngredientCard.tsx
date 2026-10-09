import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import type { ExplainedIngredient } from '../types/ingredient';
import { UNKNOWN_INGREDIENT_MESSAGE, UNCERTAIN_INGREDIENT_MESSAGE } from '../utils/matchIngredient';

type Props = {
  ingredient: ExplainedIngredient;
  preferenceNote?: string;
};

export function IngredientCard({ ingredient, preferenceNote }: Props) {
  const [expanded, setExpanded] = useState(false);
  const match = ingredient.match;
  const canExpand = match.status === 'matched';
  const label = match.status === 'matched' ? match.entry.label : 'More information needed';

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={canExpand ? `${ingredient.text}, ${label}` : ingredient.text}
        disabled={!canExpand}
        onPress={() => setExpanded((current) => !current)}
      >
        <View style={styles.header}>
          <Text style={styles.name}>{ingredient.text}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
        {canExpand ? <Text style={styles.hint}>{expanded ? 'Hide explanation' : 'Show explanation'}</Text> : null}
      </Pressable>
      {preferenceNote ? <Text style={styles.preference}>{preferenceNote}</Text> : null}
      {match.status === 'unknown' ? <Text style={styles.body}>{UNKNOWN_INGREDIENT_MESSAGE}</Text> : null}
      {match.status === 'uncertain' ? <Text style={styles.body}>{UNCERTAIN_INGREDIENT_MESSAGE}</Text> : null}
      {match.status === 'matched' && expanded ? (
        <View style={styles.details}>
          <Text style={styles.category}>{match.entry.category}</Text>
          <Text style={styles.body}>{match.entry.explanation}</Text>
          <Text style={styles.subhead}>Why it is used</Text>
          <Text style={styles.body}>{match.entry.whyUsed}</Text>
          <Text style={styles.subhead}>Context</Text>
          <Text style={styles.body}>{match.entry.consideration}</Text>
          {match.entry.ambiguity ? <Text style={styles.body}>{match.entry.ambiguity}</Text> : null}
          <Text style={styles.subhead}>Sources</Text>
          {match.entry.sources.map((source) => (
            <Pressable key={source.url} accessibilityRole="link" onPress={() => Linking.openURL(source.url)}>
              <Text style={styles.link}>{source.title}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    gap: spacing.xs,
  },
  name: {
    ...type.label,
    color: colors.text,
  },
  label: {
    ...type.caption,
    color: colors.fresh,
    fontWeight: '600',
  },
  hint: {
    ...type.caption,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  details: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  category: {
    ...type.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  subhead: {
    ...type.label,
    color: colors.text,
    marginTop: spacing.xs,
  },
  preference: {
    ...type.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  body: {
    ...type.body,
    color: colors.secondary,
  },
  link: {
    ...type.caption,
    color: colors.fresh,
    textDecorationLine: 'underline',
  },
});
