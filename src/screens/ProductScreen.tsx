import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AllergensSection } from '../components/AllergensSection';
import { Button } from '../components/Button';
import { IngredientsSection } from '../components/IngredientsSection';
import { NovaSection, ProductDisclaimer, SourceAttribution } from '../components/NovaSection';
import { NutritionSection } from '../components/NutritionSection';
import { ProductHeader } from '../components/ProductHeader';
import { useAuth } from '../context/AuthContext';
import { cacheProduct } from '../services/productCache';
import {
  favoriteStatus,
  listPreferences,
  recordScan,
  setFavorite,
  SIGN_IN_TO_SAVE,
  type IngredientPreference,
} from '../services/cloud';
import { colors, spacing, type } from '../theme';
import type { ProductScreenProps } from '../types/navigation';
import { CACHED_PRODUCT_LABEL } from '../utils/productCache';
import { matchPreferenceFlags, preferenceNote } from '../utils/preferences';

export function ProductScreen({ navigation, route }: ProductScreenProps) {
  const { product, fromCache } = route.params;
  const { profile } = useAuth();
  const [favorite, setFavoriteState] = useState(false);
  const [favoriteKnown, setFavoriteKnown] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<IngredientPreference[]>([]);

  useEffect(() => {
    void cacheProduct(product).catch(() => undefined);
    if (!profile) {
      return;
    }
    let active = true;
    void recordScan(product).then((result) => {
      if (active && !result.ok && result.code !== 'signed_out' && result.code !== 'unconfigured') {
        setNote(result.message);
      }
    });
    void favoriteStatus(product.code).then((result) => {
      if (!active || !result.ok) {
        return;
      }
      setFavoriteState(result.data);
      setFavoriteKnown(true);
    });
    void listPreferences().then((result) => {
      if (active && result.ok) {
        setPreferences(result.data);
      }
    });
    return () => {
      active = false;
    };
  }, [product, profile]);

  const notes: Record<string, string> = {};
  for (const flag of matchPreferenceFlags(
    product.ingredients.map((ingredient) => ingredient.text),
    preferences,
  )) {
    notes[flag.ingredientText] = preferenceNote(flag.preferenceType);
  }

  async function toggleFavorite() {
    if (!profile) {
      setNote(SIGN_IN_TO_SAVE);
      return;
    }
    const next = !favorite;
    const previous = favorite;
    setFavoriteState(next);
    setFavoriteKnown(true);
    const result = await setFavorite(product, next);
    if (!result.ok) {
      setFavoriteState(previous);
      setNote(result.message);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remove favorite' : 'Save favorite'}
          onPress={() => void toggleFavorite()}
        >
          <Text style={styles.heart}>{favoriteKnown && favorite ? 'Saved' : 'Save'}</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {fromCache ? <Text style={styles.cache}>{CACHED_PRODUCT_LABEL}</Text> : null}
        {note ? (
          <View style={styles.noteBlock}>
            <Text style={styles.note}>{note}</Text>
            {!profile ? <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} variant="secondary" /> : null}
          </View>
        ) : null}
        <ProductHeader product={product} />
        <IngredientsSection product={product} preferenceNotes={notes} />
        <NutritionSection product={product} />
        <AllergensSection product={product} />
        <NovaSection product={product} />
        <SourceAttribution product={product} />
        <ProductDisclaimer />
        <Button
          label="Compare this product"
          onPress={() => navigation.navigate('Compare', { incomingSlot: 'a', incomingProduct: product, requestId: Date.now() })}
          variant="secondary"
        />
        <Button
          label="Scan another product"
          onPress={() => navigation.navigate('Scanner', { requestId: Date.now() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  top: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  back: {
    ...type.label,
    color: colors.primary,
    minHeight: 44,
  },
  heart: {
    ...type.label,
    color: colors.fresh,
    minHeight: 44,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  cache: {
    ...type.body,
    color: colors.warning,
  },
  noteBlock: {
    gap: spacing.md,
  },
  note: {
    ...type.body,
    color: colors.secondary,
  },
});
