import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { canUseExtendedHistory, FREE_HISTORY_LIMIT, premiumMode, showsPremiumScreen } from '../features/entitlements';
import { clearScanHistory, deleteScan, listScanHistory, SIGN_IN_TO_SAVE, type SavedProduct } from '../services/cloud';
import { reopenProduct } from '../services/reopenProduct';
import { colors, radius, spacing, type } from '../theme';
import type { ScanHistoryScreenProps } from '../types/navigation';
import { formatScanTime } from '../utils/historyRules';

export function ScanHistoryScreen({ navigation }: ScanHistoryScreenProps) {
  const { profile } = useAuth();
  const [items, setItems] = useState<SavedProduct[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (nextPage: number, replace: boolean) => {
    setLoading(true);
    const result = await listScanHistory(nextPage);
    setLoading(false);
    setLoaded(true);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(null);
    setPage(nextPage);
    setHasMore(result.data.hasMore);
    setItems((current) => (replace ? result.data.items : [...current, ...result.data.items]));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (profile) {
        void load(0, true);
      }
    }, [load, profile]),
  );

  async function openItem(item: SavedProduct) {
    setOpeningId(item.id);
    const result = await reopenProduct(item.barcode);
    setOpeningId(null);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    navigation.navigate('Product', { product: result.product, fromCache: result.fromCache });
  }

  function confirmDelete(item: SavedProduct) {
    Alert.alert('Remove this scan?', item.productName ?? item.barcode, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          void deleteScan(item.id).then((result) => {
            if (!result.ok) {
              setMessage(result.message);
              return;
            }
            setItems((current) => current.filter((entry) => entry.id !== item.id));
          });
        },
      },
    ]);
  }

  function confirmClear() {
    Alert.alert('Clear scan history?', 'This removes every saved scan for this account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear history',
        style: 'destructive',
        onPress: () => {
          void clearScanHistory().then((result) => {
            if (!result.ok) {
              setMessage(result.message);
              return;
            }
            setItems([]);
            setHasMore(false);
          });
        },
      },
    ]);
  }

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Scan history</Text>
        {!profile ? (
          <View style={styles.stack}>
            <Text style={styles.body}>{SIGN_IN_TO_SAVE}</Text>
            <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} />
          </View>
        ) : null}
        {profile && loaded && items.length === 0 && !loading && !message ? (
          <Text style={styles.body}>Scans you open while signed in will appear here.</Text>
        ) : null}
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Pressable accessibilityRole="button" onPress={() => void openItem(item)}>
              <Text style={styles.name}>{item.productName ?? 'Unnamed product'}</Text>
              <Text style={styles.caption}>{item.brand ?? item.barcode}</Text>
              <Text style={styles.caption}>{formatScanTime(item.savedAt, Date.now())}</Text>
              {openingId === item.id ? <Text style={styles.caption}>Opening…</Text> : null}
            </Pressable>
            <Button label="Remove" onPress={() => confirmDelete(item)} variant="ghost" />
          </View>
        ))}
        {message ? <Text style={styles.error}>{message}</Text> : null}
        {hasMore ? <Button label="Load more" loading={loading} onPress={() => void load(page + 1, false)} /> : null}
        {profile && items.length > 0 ? (
          <Button label="Clear history" onPress={confirmClear} variant="secondary" />
        ) : null}
        {profile && !canUseExtendedHistory(premiumMode) && items.length >= FREE_HISTORY_LIMIT ? (
          <Text style={styles.body}>
            Free history shows the latest {FREE_HISTORY_LIMIT} scans.
            {showsPremiumScreen(premiumMode)
              ? ' Extended history is described on the Premium screen and is not for sale yet.'
              : ''}
          </Text>
        ) : null}
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
    gap: spacing.sm,
  },
  name: { ...type.label, color: colors.text },
  body: { ...type.body, color: colors.secondary },
  caption: { ...type.caption, color: colors.secondary },
  error: { ...type.caption, color: colors.error },
});
