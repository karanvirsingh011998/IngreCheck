import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppShell } from '../components/AppShell';
import { LandingHome } from '../components/LandingHome';
import { useAuth } from '../context/AuthContext';
import { dashboardDetail, dashboardLinks, openAppDestination } from '../navigation/appLinks';
import { listScanHistory, type SavedProduct } from '../services/cloud';
import { reopenProduct } from '../services/reopenProduct';
import { colors, radius, spacing, type } from '../theme';
import type { RootStackParamList } from '../types/navigation';

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const name = profile?.displayName?.trim() || profile?.email || 'there';
  const [recent, setRecent] = useState<SavedProduct[] | null>(null);
  const [recentNote, setRecentNote] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!profile) {
        setRecent(null);
        setRecentNote(null);
        return undefined;
      }
      let active = true;
      void listScanHistory(0).then((result) => {
        if (!active) {
          return;
        }
        if (!result.ok) {
          setRecent(null);
          setRecentNote(result.message);
          return;
        }
        setRecentNote(null);
        setRecent(result.data.items.slice(0, 3));
      });
      return () => {
        active = false;
      };
    }, [profile]),
  );

  async function openRecent(item: SavedProduct) {
    const result = await reopenProduct(item.barcode);
    if (!result.ok) {
      setRecentNote(result.message);
      return;
    }
    navigation.navigate('Product', { product: result.product, fromCache: result.fromCache });
  }

  if (profile) {
    return (
      <AppShell>
        <ScrollView contentContainerStyle={styles.dashboard}>
          <Text style={styles.headline}>Dashboard</Text>
          <Text style={styles.description}>Hello, {name}.</Text>
          <View style={styles.grid}>
            {dashboardLinks.map((link) => (
              <Pressable
                key={link.destination}
                accessibilityRole="button"
                onPress={() => openAppDestination(navigation, link.destination)}
                style={styles.tile}
              >
                <Text style={styles.tileTitle}>{link.label}</Text>
                <Text style={styles.tileDetail}>{dashboardDetail(link.destination)}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.tileTitle}>Recent scans</Text>
          {recent === null && !recentNote ? <Text style={styles.description}>Loading recent scans…</Text> : null}
          {recentNote ? <Text style={styles.description}>{recentNote}</Text> : null}
          {recent && recent.length === 0 ? (
            <Text style={styles.description}>No saved scans yet. Scan or search for a product to start.</Text>
          ) : null}
          {recent?.map((item) => (
            <Pressable key={item.id} accessibilityRole="button" onPress={() => void openRecent(item)} style={styles.tile}>
              <Text style={styles.tileTitle}>{item.productName ?? 'Unnamed product'}</Text>
              <Text style={styles.tileDetail}>{item.brand ?? item.barcode}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <LandingHome navigation={navigation} />
    </AppShell>
  );
}

const styles = StyleSheet.create({
  headline: {
    ...type.title,
    color: colors.text,
  },
  description: {
    ...type.body,
    color: colors.secondary,
  },
  dashboard: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    width: '100%',
    minHeight: 88,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  tileTitle: {
    ...type.label,
    color: colors.primary,
  },
  tileDetail: {
    ...type.caption,
    color: colors.secondary,
  },
});
