import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import type { Product } from '../types/product';
import { BrandMark } from './BrandMark';

type Props = {
  product: Product;
};

export function ProductHeader({ product }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(product.imageUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [product.code, product.imageUrl]);
  return (
    <View style={styles.card}>
      {showImage ? (
        <Image
          accessibilityLabel={`${product.name} package`}
          onError={() => setImageFailed(true)}
          source={{ uri: product.imageUrl ?? undefined }}
          style={styles.image}
        />
      ) : (
        <View style={styles.placeholder}>
          <BrandMark size={64} />
          <Text style={styles.placeholderText}>No package photo</Text>
        </View>
      )}
      <Text style={styles.name}>{product.name}</Text>
      {product.brands ? <Text style={styles.brand}>{product.brands}</Text> : null}
      <Text style={styles.meta}>Barcode {product.code}</Text>
      {product.categories ? <Text style={styles.meta}>{product.categories}</Text> : null}
      {product.countries ? <Text style={styles.meta}>{product.countries}</Text> : null}
      {product.lastUpdated ? (
        <Text style={styles.meta}>Database record updated {product.lastUpdated}. This is not the date on your package.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.mint,
    resizeMode: 'contain',
  },
  placeholder: {
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderText: {
    ...type.caption,
    color: colors.primary,
  },
  name: {
    ...type.title,
    color: colors.text,
    marginTop: spacing.sm,
  },
  brand: {
    ...type.heading,
    color: colors.fresh,
  },
  meta: {
    ...type.caption,
    color: colors.secondary,
  },
});
