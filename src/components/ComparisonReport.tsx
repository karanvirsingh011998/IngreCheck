import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import {
  COMPARISON_SAFETY_NOTICE,
  COVERAGE_NOTE,
  INGREDIENT_DIFFERENCE_CAVEAT,
  NOVA_PROCESSING_NOTE,
  type ProductComparison,
} from '../utils/compareProducts';

type Props = {
  comparison: ProductComparison;
};

function Block({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.caption}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export function ComparisonReport({ comparison }: Props) {
  const ingredients = comparison.ingredients;
  return (
    <View style={styles.stack}>
      <View style={styles.card}>
        <Text style={styles.heading}>Summary</Text>
        {comparison.summary.map((line) => (
          <Text key={line} style={styles.body}>
            {line}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Ingredients</Text>
        <Block title="Product A recorded list" body={ingredients.originalA ?? 'Not available'} />
        {ingredients.englishA ? <Block title="Product A English list" body={ingredients.englishA} /> : null}
        <Block title="Product B recorded list" body={ingredients.originalB ?? 'Not available'} />
        {ingredients.englishB ? <Block title="Product B English list" body={ingredients.englishB} /> : null}
        {ingredients.comparable ? (
          <>
            <Block title="Names recorded for both" body={ingredients.shared.join(', ') || 'None matched'} />
            <Block title="Names recorded only for Product A" body={ingredients.onlyA.join(', ') || 'None'} />
            <Block title="Names recorded only for Product B" body={ingredients.onlyB.join(', ') || 'None'} />
            <Text style={styles.caption}>{INGREDIENT_DIFFERENCE_CAVEAT}</Text>
          </>
        ) : (
          <Text style={styles.body}>
            One or both ingredient lists are missing, so this screen does not treat a missing list as an empty recipe.
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Nutrition</Text>
        {comparison.nutrition.map((row) => (
          <View key={`${row.label}-${row.unit}`} style={styles.block}>
            <Text style={styles.subhead}>
              {row.label}
              {row.unit === 'g' ? '' : ` (${row.unit})`}
            </Text>
            <Text style={styles.body}>Product A: {row.valueA}</Text>
            <Text style={styles.body}>Product B: {row.valueB}</Text>
            {row.statement ? <Text style={styles.caption}>{row.statement}</Text> : null}
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Allergens</Text>
        <Block
          title="Product A declared allergens"
          body={comparison.allergensMissingA ? 'Not available' : comparison.allergensA.join(', ') || 'None declared in the record'}
        />
        <Block
          title="Product A traces"
          body={comparison.allergensMissingA ? 'Not available' : comparison.tracesA.join(', ') || 'No traces recorded'}
        />
        <Block
          title="Product B declared allergens"
          body={comparison.allergensMissingB ? 'Not available' : comparison.allergensB.join(', ') || 'None declared in the record'}
        />
        <Block
          title="Product B traces"
          body={comparison.allergensMissingB ? 'Not available' : comparison.tracesB.join(', ') || 'No traces recorded'}
        />
        <Text style={styles.body}>{COMPARISON_SAFETY_NOTICE}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>NOVA</Text>
        <Block title="Product A" body={comparison.novaA ?? 'Not available'} />
        <Block title="Product B" body={comparison.novaB ?? 'Not available'} />
        <Text style={styles.caption}>{NOVA_PROCESSING_NOTE}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Ingredient notes</Text>
        <Block title="Product A" body={comparison.insightsA.join('\n') || 'Explanation not available'} />
        {comparison.preferencesA.map((hit) => (
          <Text key={`a-${hit.ingredientText}`} style={styles.caption}>
            Product A, {hit.ingredientText}: {hit.note} A saved preference does not mean the product is unsafe.
          </Text>
        ))}
        <Block title="Product B" body={comparison.insightsB.join('\n') || 'Explanation not available'} />
        {comparison.preferencesB.map((hit) => (
          <Text key={`b-${hit.ingredientText}`} style={styles.caption}>
            Product B, {hit.ingredientText}: {hit.note} A saved preference does not mean the product is unsafe.
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Data completeness</Text>
        <Block
          title={`Product A: ${comparison.coverageA.level}`}
          body={`Present: ${comparison.coverageA.present.join(', ') || 'None'}. Missing: ${comparison.coverageA.missing.join(', ') || 'None'}.`}
        />
        <Block
          title={`Product B: ${comparison.coverageB.level}`}
          body={`Present: ${comparison.coverageB.present.join(', ') || 'None'}. Missing: ${comparison.coverageB.missing.join(', ') || 'None'}.`}
        />
        <Text style={styles.caption}>{COVERAGE_NOTE}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heading: { ...type.heading, color: colors.text },
  subhead: { ...type.label, color: colors.text },
  body: { ...type.body, color: colors.secondary },
  caption: { ...type.caption, color: colors.secondary },
  block: { gap: spacing.xs },
});
