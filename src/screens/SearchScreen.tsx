import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppShell } from '../components/AppShell';
import { Button } from '../components/Button';
import { searchProducts } from '../services/openFoodFacts';
import { reopenProduct } from '../services/reopenProduct';
import { colors, radius, spacing, type } from '../theme';
import type { SearchScreenProps } from '../types/navigation';
import type { LookupFailureCode } from '../types/product';
import { LOOKUP_COPY } from '../utils/lookupCopy';
import type { SearchHit } from '../utils/normalizeSearch';
import { normalizeSearchQuery } from '../utils/searchQuery';

export function SearchScreen({ navigation }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openingCode, setOpeningCode] = useState<string | null>(null);
  const [error, setError] = useState<{ code: LookupFailureCode | 'empty'; message: string } | null>(null);
  const [searched, setSearched] = useState(false);
  const requestId = useRef(0);

  async function run(nextQuery: string, nextPage: number, append: boolean) {
    const id = requestId.current + 1;
    requestId.current = id;
    setActiveQuery(nextQuery);
    setPage(nextPage);
    setLoading(true);
    setError(null);
    const result = await searchProducts(nextQuery, nextPage);
    if (requestId.current !== id) {
      return;
    }
    setLoading(false);
    setSearched(true);
    if (!result.ok) {
      setError({ code: result.code, message: result.message });
      if (!append) {
        setHits([]);
        setPageCount(0);
      }
      return;
    }
    setActiveQuery(nextQuery);
    setPage(result.data.page);
    setPageCount(result.data.hits.length === 0 && append ? nextPage - 1 : result.data.pageCount);
    setHits((current) => (append ? [...current, ...result.data.hits] : result.data.hits));
  }

  function submit() {
    const normalized = normalizeSearchQuery(query);
    if (!normalized) {
      setError({ code: 'empty', message: 'Enter a product name or brand.' });
      setSearched(true);
      setHits([]);
      return;
    }
    void run(normalized, 1, false);
  }

  function clear() {
    requestId.current += 1;
    setQuery('');
    setActiveQuery(null);
    setHits([]);
    setPage(1);
    setPageCount(0);
    setLoading(false);
    setError(null);
    setSearched(false);
    setOpeningCode(null);
  }

  async function openHit(hit: SearchHit) {
    if (openingCode) {
      return;
    }
    setOpeningCode(hit.code);
    const result = await reopenProduct(hit.code);
    setOpeningCode(null);
    if (!result.ok) {
      setError({ code: 'server', message: result.message });
      return;
    }
    navigation.navigate('Product', { product: result.product, fromCache: result.fromCache });
  }

  const canLoadMore = Boolean(activeQuery) && page < pageCount && !loading && !error;

  return (
    <AppShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Search products</Text>
          <Text style={styles.body}>
            Search Open Food Facts by product name or brand. Many products are missing from that database, including
            some foods sold in India.
          </Text>
          <TextInput
            accessibilityLabel="Product name or brand"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            onSubmitEditing={submit}
            placeholder="Product name or brand"
            placeholderTextColor={colors.secondary}
            returnKeyType="search"
            style={styles.input}
            value={query}
          />
          <Button label="Search" loading={loading} onPress={submit} />
          {query.length > 0 || searched ? (
            <Button label="Clear search" onPress={clear} variant="secondary" />
          ) : null}
          {!searched && !loading ? (
            <Text style={styles.body}>Type a name or brand, then tap Search. The app waits until you submit.</Text>
          ) : null}
          {loading && hits.length === 0 ? <ActivityIndicator color={colors.primary} /> : null}
          {error ? (
            <View style={styles.stack}>
              <Text style={styles.errorTitle}>{error.code === 'empty' ? 'Add a search' : LOOKUP_COPY[error.code].title}</Text>
              <Text style={styles.error}>{error.message}</Text>
              {error.code !== 'empty' && activeQuery ? (
                <Button label="Try again" onPress={() => void run(activeQuery, page, hits.length > 0)} variant="secondary" />
              ) : null}
            </View>
          ) : null}
          {searched && !loading && !error && hits.length === 0 ? (
            <Text style={styles.body}>No products matched that search. Try another name or brand, or scan the barcode.</Text>
          ) : null}
          {hits.map((hit) => (
            <Pressable
              key={hit.code}
              accessibilityRole="button"
              accessibilityLabel={hit.name ?? 'Unnamed product'}
              disabled={openingCode !== null}
              onPress={() => void openHit(hit)}
              style={styles.card}
            >
              {hit.imageUrl ? (
                <Image accessibilityIgnoresInvertColors accessibilityLabel="" source={{ uri: hit.imageUrl }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbMissing}>
                  <Text style={styles.caption}>No photo</Text>
                </View>
              )}
              <View style={styles.cardText}>
                <Text style={styles.name}>{hit.name ?? 'Unnamed product'}</Text>
                <Text style={styles.caption}>{hit.brands ?? 'Brand not available'}</Text>
                <Text style={styles.caption}>{hit.quantity ?? 'Quantity not available'}</Text>
                {openingCode === hit.code ? <Text style={styles.caption}>Opening…</Text> : null}
              </View>
            </Pressable>
          ))}
          {canLoadMore ? (
            <Button label="Load more" onPress={() => void run(activeQuery ?? '', page + 1, true)} variant="secondary" />
          ) : null}
          {loading && hits.length > 0 ? <ActivityIndicator color={colors.primary} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  title: { ...type.display, color: colors.primary },
  body: { ...type.body, color: colors.secondary },
  input: {
    ...type.body,
    color: colors.text,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  stack: { gap: spacing.sm },
  errorTitle: { ...type.label, color: colors.error },
  error: { ...type.body, color: colors.error },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  thumb: { width: 72, height: 72, borderRadius: radius.sm, backgroundColor: colors.mint, resizeMode: 'contain' },
  thumbMissing: {
    width: 72,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, gap: spacing.xs },
  name: { ...type.label, color: colors.text },
  caption: { ...type.caption, color: colors.secondary },
});
