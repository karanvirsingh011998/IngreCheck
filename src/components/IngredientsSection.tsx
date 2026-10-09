import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import type { Product } from '../types/product';
import { IngredientCard } from './IngredientCard';

type Props = {
  product: Product;
  preferenceNotes?: Readonly<Record<string, string>>;
};

export function IngredientsSection({ product, preferenceNotes }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Ingredients</Text>
      {product.ingredientsText ? (
        <View style={styles.original}>
          <Text style={styles.caption}>Recorded list</Text>
          <Text style={styles.originalText}>{product.ingredientsText}</Text>
          <Text style={styles.caption}>
            This is only what the database recorded. It may be incomplete, and it has not been checked against your
            package.
          </Text>
        </View>
      ) : (
        <Text style={styles.empty}>
          No ingredient list is available. That does not mean this product has no ingredients.
        </Text>
      )}
      {product.ingredients.map((ingredient, index) => (
        <IngredientCard
          key={`${ingredient.text}-${index}`}
          ingredient={ingredient}
          preferenceNote={preferenceNotes?.[ingredient.text]}
        />
      ))}
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
  original: {
    backgroundColor: colors.mint,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  caption: {
    ...type.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  originalText: {
    ...type.body,
    color: colors.text,
  },
  empty: {
    ...type.body,
    color: colors.secondary,
  },
});
