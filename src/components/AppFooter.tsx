import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { openAppDestination, signedInFooterLinks, signedOutFooterLinks } from '../navigation/appLinks';
import { colors, spacing, type } from '../theme';
import type { RootStackParamList } from '../types/navigation';

export function AppFooter() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { profile } = useAuth();
  const links = profile ? signedInFooterLinks : signedOutFooterLinks;

  return (
    <View style={styles.bar}>
      {links.map((link) => {
        const active = route.name === link.destination;
        return (
          <Pressable
            key={link.destination}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => openAppDestination(navigation, link.destination)}
            style={styles.item}
          >
            <Text style={[styles.label, active && styles.active]}>{link.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  item: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  label: {
    ...type.caption,
    color: colors.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  active: {
    color: colors.primary,
  },
});
