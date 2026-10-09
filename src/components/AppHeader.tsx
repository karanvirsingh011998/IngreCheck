import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { openAppDestination, signedInMenuLinks, signedOutMenuLinks, type AppDestination } from '../navigation/appLinks';
import { colors, radius, spacing, type } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import { BrandMark } from './BrandMark';

export function AppHeader() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const links = profile ? signedInMenuLinks : signedOutMenuLinks;

  function go(destination: AppDestination) {
    setOpen(false);
    openAppDestination(navigation, destination);
  }

  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="IngreCheck home"
        onPress={() => go('Home')}
        style={styles.brand}
      >
        <BrandMark size={36} />
        <Text style={styles.name}>IngreCheck</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? 'Close menu' : 'Open menu'}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((current) => !current)}
        style={styles.menuButton}
      >
        <View style={styles.barLine} />
        <View style={styles.barLine} />
        <View style={styles.barLine} />
      </Pressable>
      <Modal animationType="fade" onRequestClose={() => setOpen(false)} transparent visible={open}>
        <View style={styles.modal}>
          <Pressable accessibilityLabel="Close menu" onPress={() => setOpen(false)} style={styles.backdrop} />
          <View style={styles.panel}>
            {links.map((link) => {
              const active = route.name === link.destination;
              return (
                <Pressable
                  key={link.destination}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => go(link.destination)}
                  style={styles.link}
                >
                  <Text style={[styles.linkText, active && styles.linkActive]}>{link.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
    minHeight: 44,
  },
  name: {
    ...type.heading,
    color: colors.primary,
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  barLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.primary,
  },
  modal: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(32, 40, 32, 0.35)',
  },
  panel: {
    marginTop: 72,
    marginRight: spacing.lg,
    minWidth: 240,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
  },
  link: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  linkText: {
    ...type.body,
    color: colors.text,
  },
  linkActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
