import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { AppFooter } from './AppFooter';
import { AppHeader } from './AppHeader';

type Props = {
  children: ReactNode;
  showFooter?: boolean;
};

export function AppShell({ children, showFooter = true }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />
      <View style={styles.body}>{children}</View>
      {showFooter ? <AppFooter /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
});
