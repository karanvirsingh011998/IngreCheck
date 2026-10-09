import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { OPEN_FOOD_FACTS_TERMS } from '../config/openFoodFacts';
import { colors, radius, spacing, type } from '../theme';
import type { Product } from '../types/product';
import { NOVA_CAVEAT, NOVA_DESCRIPTIONS } from '../utils/nova';

type Props = {
  product: Product;
};

export function NovaSection({ product }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Processing</Text>
      {product.novaGroup ? (
        <View style={styles.card}>
          <Text style={styles.group}>NOVA {product.novaGroup}</Text>
          <Text style={styles.body}>{NOVA_DESCRIPTIONS[product.novaGroup]}</Text>
          <Text style={styles.note}>{NOVA_CAVEAT}</Text>
        </View>
      ) : (
        <Text style={styles.empty}>No NOVA classification is available for this product.</Text>
      )}
    </View>
  );
}

export function SourceAttribution({ product }: { product: Product }) {
  return (
    <View style={styles.sources}>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL(product.sourceUrl)}>
        <Text style={styles.source}>Open this product on Open Food Facts</Text>
      </Pressable>
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL(OPEN_FOOD_FACTS_TERMS)}>
        <Text style={styles.source}>Open Food Facts data is used under its terms, including the Open Database License</Text>
      </Pressable>
      <Text style={styles.note}>IngreCheck does not verify this record. Missing values stay unavailable.</Text>
    </View>
  );
}

export function ProductDisclaimer() {
  return (
    <Text style={styles.disclaimer}>
      Barcode records can be outdated or different from the package in your hand. For allergies, ingredients, and
      nutrition, check the current label. This app does not diagnose health conditions or detect contaminants.
    </Text>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  heading: {
    ...type.title,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  group: {
    ...type.heading,
    color: colors.primary,
  },
  body: {
    ...type.body,
    color: colors.text,
  },
  note: {
    ...type.caption,
    color: colors.secondary,
  },
  empty: {
    ...type.body,
    color: colors.secondary,
  },
  sources: { gap: spacing.sm },
  source: {
    ...type.caption,
    color: colors.fresh,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    ...type.caption,
    color: colors.secondary,
  },
});
