import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import type { Product } from '../types/product';
import { allergenNote } from '../utils/allergens';

type Props = {
  product: Product;
};

function ChipList({ labels }: { labels: string[] }) {
  return (
    <View style={styles.chips}>
      {labels.map((label) => (
        <View key={label} style={styles.chip}>
          <Text style={styles.chipText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

export function AllergensSection({ product }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Allergens</Text>
      <View style={styles.card}>
        {product.allergenStatus === 'missing' ? (
          <Text style={styles.body}>Allergen information is not available for this product.</Text>
        ) : null}
        {product.allergens.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.caption}>Listed in the product data</Text>
            <ChipList labels={product.allergens} />
          </View>
        ) : null}
        {product.traces.length > 0 ? (
          <View style={styles.block}>
            <Text style={styles.caption}>Possible traces listed in the product data</Text>
            <ChipList labels={product.traces} />
          </View>
        ) : null}
        <Text style={styles.note}>{allergenNote()}</Text>
      </View>
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
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  block: {
    gap: spacing.sm,
  },
  caption: {
    ...type.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    ...type.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  body: {
    ...type.body,
    color: colors.secondary,
  },
  note: {
    ...type.caption,
    color: colors.secondary,
  },
});
