import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { listFavorites, listScanHistory, SIGN_IN_TO_SAVE, type SavedProduct } from '../services/cloud';
import { reopenProduct } from '../services/reopenProduct';
import { colors, radius, spacing, type } from '../theme';
import type { SelectSavedScreenProps } from '../types/navigation';

export function SelectSavedScreen({ navigation, route }: SelectSavedScreenProps) {
  const { profile } = useAuth();
  const [items, setItems] = useState<SavedProduct[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [history, favorites] = await Promise.all([listScanHistory(0), listFavorites()]);
    setLoading(false);
    if (!history.ok && !favorites.ok) {
      setMessage(history.message);
      return;
    }
    const merged: SavedProduct[] = [];
    const seen = new Set<string>();
    for (const item of [...(favorites.ok ? favorites.data : []), ...(history.ok ? history.data.items : [])]) {
      if (seen.has(item.barcode)) {
        continue;
      }
      seen.add(item.barcode);
      merged.push(item);
    }
    setItems(merged);
    setMessage(history.ok || favorites.ok ? null : 'Saved products could not be loaded.');
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (profile) {
        void load();
      }
    }, [load, profile]),
  );

  async function openItem(item: SavedProduct) {
    setOpening(item.barcode);
    const result = await reopenProduct(item.barcode);
    setOpening(null);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    navigation.navigate('Compare', {
      incomingSlot: route.params.slot,
      incomingProduct: result.product,
      requestId: Date.now(),
    });
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Saved products</Text>
        {!profile ? (
          <View style={styles.stack}>
            <Text style={styles.body}>{SIGN_IN_TO_SAVE}</Text>
            <Text style={styles.body}>You can still scan both products without an account.</Text>
            <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} />
          </View>
        ) : null}
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {profile && !loading && items.length === 0 ? (
          <Text style={styles.body}>No saved scans or favorites yet. Scan a product to fill this list.</Text>
        ) : null}
        {items.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" onPress={() => void openItem(item)} style={styles.card}>
            <Text style={styles.name}>{item.productName ?? 'Unnamed product'}</Text>
            <Text style={styles.caption}>{item.brand ?? item.barcode}</Text>
            {opening === item.barcode ? <Text style={styles.caption}>Opening…</Text> : null}
          </Pressable>
        ))}
        {message ? <Text style={styles.error}>{message}</Text> : null}
        {message ? <Button label="Try again" onPress={() => void load()} variant="secondary" /> : null}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  back: { ...type.label, color: colors.primary, minHeight: 44 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  title: { ...type.display, color: colors.primary },
  stack: { gap: spacing.md },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  name: { ...type.label, color: colors.text },
  body: { ...type.body, color: colors.secondary },
  caption: { ...type.caption, color: colors.secondary },
  error: { ...type.caption, color: colors.error },
});
