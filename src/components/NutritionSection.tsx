import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import type { Product } from '../types/product';

type Props = {
  product: Product;
};

export function NutritionSection({ product }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Nutrition</Text>
      {product.nutrition.length === 0 ? (
        <Text style={styles.empty}>Not available</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.basis}>{product.nutritionBasis ?? 'Nutrition values'}</Text>
          {product.nutrition.map((row) => (
            <View key={row.key} style={styles.row}>
              <Text style={styles.label}>{row.label}</Text>
              <Text style={styles.value}>{row.display}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
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
  empty: {
    ...type.body,
    color: colors.secondary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  basis: {
    ...type.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    ...type.body,
    color: colors.text,
    flex: 1,
  },
  value: {
    ...type.body,
    color: colors.secondary,
    textAlign: 'right',
  },
});
