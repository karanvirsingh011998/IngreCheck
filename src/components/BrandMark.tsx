import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  size?: number;
};

export function BrandMark({ size = 72 }: Props) {
  const frame = size * 0.16;
  const stroke = Math.max(3, size * 0.045);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="IngreCheck"
      style={[styles.mark, { width: size, height: size, borderRadius: size * 0.22 }]}
    >
      <View
        style={[
          styles.frame,
          {
            top: frame,
            left: frame,
            right: frame,
            bottom: frame,
            borderRadius: size * 0.14,
            borderWidth: stroke,
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          {
            width: size * 0.28,
            height: size * 0.42,
            borderRadius: size * 0.2,
            left: size * 0.3,
            top: size * 0.32,
            transform: [{ rotate: '-28deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.leaf,
          {
            width: size * 0.24,
            height: size * 0.36,
            borderRadius: size * 0.18,
            left: size * 0.44,
            top: size * 0.26,
            transform: [{ rotate: '24deg' }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    position: 'absolute',
    borderColor: colors.mint,
  },
  leaf: {
    position: 'absolute',
    backgroundColor: colors.fresh,
  },
});
