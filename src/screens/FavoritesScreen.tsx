import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { listFavorites, removeFavorite, SIGN_IN_TO_SAVE, type SavedProduct } from '../services/cloud';
import { reopenProduct } from '../services/reopenProduct';
import { colors, radius, spacing, type } from '../theme';
import type { FavoritesScreenProps } from '../types/navigation';

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { profile } = useAuth();
  const [items, setItems] = useState<SavedProduct[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const result = await listFavorites();
    setLoaded(true);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(null);
    setItems(result.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (profile) {
        void load();
      }
    }, [load, profile]),
  );

  async function openItem(item: SavedProduct) {
    const result = await reopenProduct(item.barcode);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    navigation.navigate('Product', { product: result.product, fromCache: result.fromCache });
  }

  async function remove(item: SavedProduct) {
    const result = await removeFavorite(item.id);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Favorites</Text>
        {!profile ? (
          <View style={styles.stack}>
            <Text style={styles.body}>{SIGN_IN_TO_SAVE}</Text>
            <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} />
          </View>
        ) : null}
        {profile && loaded && items.length === 0 && !message ? (
          <Text style={styles.body}>Save a product from its page to keep it here.</Text>
        ) : null}
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Pressable accessibilityRole="button" onPress={() => void openItem(item)}>
              <Text style={styles.name}>{item.productName ?? 'Unnamed product'}</Text>
              <Text style={styles.caption}>{item.brand ?? item.barcode}</Text>
            </Pressable>
            <Button label="Remove" onPress={() => void remove(item)} variant="ghost" />
          </View>
        ))}
        {message ? <Text style={styles.error}>{message}</Text> : null}
      </ScrollView>
    </SafeAreaView>
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
    gap: spacing.sm,
  },
  name: { ...type.label, color: colors.text },
  body: { ...type.body, color: colors.secondary },
  caption: { ...type.caption, color: colors.secondary },
  error: { ...type.caption, color: colors.error },
});
