import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { ComparisonReport } from '../components/ComparisonReport';
import { useAuth } from '../context/AuthContext';
import { listPreferences } from '../services/cloud';
import { colors, radius, spacing, type } from '../theme';
import type { Product } from '../types/product';
import type { CompareScreenProps } from '../types/navigation';
import { clearCompareSlots, readCompareSlots, saveCompareSlot } from '../state/compareSlots';
import { compareProducts } from '../utils/compareProducts';
import type { PreferenceType } from '../utils/preferences';

type Slot = 'a' | 'b';

export function CompareScreen({ navigation, route }: CompareScreenProps) {
  const { profile } = useAuth();
  const [productA, setProductA] = useState<Product | null>(() => readCompareSlots().a);
  const [productB, setProductB] = useState<Product | null>(() => readCompareSlots().b);
  const [preferences, setPreferences] = useState<{ ingredientName: string; preferenceType: PreferenceType }[]>([]);

  useEffect(() => {
    const incoming = route.params?.incomingProduct;
    const slot = route.params?.incomingSlot;
    if (!route.params?.requestId || !incoming || !slot) {
      return;
    }
    const next = saveCompareSlot(slot, incoming);
    setProductA(next.a);
    setProductB(next.b);
  }, [route.params?.incomingProduct, route.params?.incomingSlot, route.params?.requestId]);

  useEffect(() => {
    if (!profile) {
      setPreferences([]);
      return;
    }
    void listPreferences().then((result) => {
      if (result.ok) {
        setPreferences(result.data);
      }
    });
  }, [profile]);

  function choose(slot: Slot, manual: boolean) {
    const other = slot === 'a' ? productB : productA;
    navigation.navigate('Scanner', {
      compareSlot: slot,
      openManual: manual,
      requestId: Date.now(),
      reuseProduct: other ?? undefined,
    });
  }

  const comparison = productA && productB ? compareProducts(productA, productB, preferences) : null;

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Compare products</Text>
        <Text style={styles.body}>
          Compare two packaged foods from their Open Food Facts records. An account is optional. This screen does not
          choose a healthier product.
        </Text>
        <SlotCard
          label="Product A"
          product={productA}
          onScan={() => choose('a', false)}
          onManual={() => choose('a', true)}
          onSaved={() => navigation.navigate('SelectSaved', { slot: 'a' })}
        />
        <SlotCard
          label="Product B"
          product={productB}
          onScan={() => choose('b', false)}
          onManual={() => choose('b', true)}
          onSaved={() => navigation.navigate('SelectSaved', { slot: 'b' })}
        />
        {comparison ? <ComparisonReport comparison={comparison} /> : null}
        {productA || productB ? (
          <Button
            label="Clear comparison"
            onPress={() => {
              const next = clearCompareSlots();
              setProductA(next.a);
              setProductB(next.b);
            }}
            variant="secondary"
          />
        ) : null}
      </ScrollView>
    </AppShell>
  );
}

function SlotCard({
  label,
  product,
  onScan,
  onManual,
  onSaved,
}: {
  label: string;
  product: Product | null;
  onScan: () => void;
  onManual: () => void;
  onSaved: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <View style={styles.card}>
      <Text style={styles.slot}>{label}</Text>
      {product ? (
        <>
          {product.imageUrl && !imageFailed ? (
            <Image
              accessibilityLabel={`${product.name} package`}
              onError={() => setImageFailed(true)}
              source={{ uri: product.imageUrl }}
              style={styles.image}
            />
          ) : (
            <Text style={styles.caption}>No package photo</Text>
          )}
          <Text style={styles.name}>{product.name}</Text>
          {product.brands ? <Text style={styles.brand}>{product.brands}</Text> : null}
          {product.quantity ? <Text style={styles.caption}>{product.quantity}</Text> : null}
          <Text style={styles.caption}>Barcode {product.code}</Text>
          {product.nutritionGrade ? (
            <Text style={styles.caption}>
              Recorded nutrition grade: {product.nutritionGrade}. This is a database tag, not an IngreCheck health score.
            </Text>
          ) : null}
          {(product.recordedLabels ?? []).length > 0 ? (
            <Text style={styles.caption}>Recorded labels: {(product.recordedLabels ?? []).join(', ')}</Text>
          ) : null}
          <Text style={styles.caption}>Replace this product</Text>
        </>
      ) : (
        <Text style={styles.body}>Scan or select a product.</Text>
      )}
      <Button label="Scan barcode" onPress={onScan} />
      <Button label="Enter a barcode" onPress={onManual} variant="secondary" />
      <Button label="Choose a saved product" onPress={onSaved} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  title: { ...type.display, color: colors.primary },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  slot: { ...type.caption, color: colors.fresh, fontWeight: '600' },
  image: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.mint,
    resizeMode: 'contain',
  },
  name: { ...type.heading, color: colors.text },
  brand: { ...type.body, color: colors.fresh },
  body: { ...type.body, color: colors.secondary },
  caption: { ...type.caption, color: colors.secondary },
});
