import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { ManualBarcodeModal } from '../components/ManualBarcodeModal';
import { StateMessage } from '../components/StateMessage';
import { colors, radius, spacing, type } from '../theme';
import type { LookupFailureCode } from '../types/product';
import type { ScannerScreenProps } from '../types/navigation';
import { normalizeScannedBarcode } from '../utils/barcode';
import { LOOKUP_COPY } from '../utils/lookupCopy';
import { lookupProduct } from '../services/openFoodFacts';

type Phase = 'ready' | 'loading' | 'error';

export function ScannerScreen({ navigation, route }: ScannerScreenProps) {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraFailed, setCameraFailed] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('ready');
  const [failure, setFailure] = useState<LookupFailureCode | null>(null);
  const lastCode = useRef<string | null>(null);
  const lock = useRef(false);
  const requestActive = useRef(true);

  const runLookup = useCallback(
    async (code: string) => {
      lastCode.current = code;
      lock.current = true;
      setPhase('loading');
      setFailure(null);
      setManualOpen(false);
      const reused = route.params?.reuseProduct;
      if (reused && reused.code === code && route.params?.compareSlot) {
        if (!requestActive.current) {
          return;
        }
        setPhase('ready');
        navigation.navigate('Compare', {
          incomingSlot: route.params.compareSlot,
          incomingProduct: reused,
          requestId: Date.now(),
        });
        return;
      }
      const result = await lookupProduct(code);
      if (!requestActive.current) {
        return;
      }
      if (!result.ok) {
        lock.current = false;
        setFailure(result.code);
        setPhase('error');
        return;
      }
      setPhase('ready');
      if (route.params?.compareSlot) {
        navigation.navigate('Compare', {
          incomingSlot: route.params.compareSlot,
          incomingProduct: result.product,
          requestId: Date.now(),
        });
        return;
      }
      navigation.navigate('Product', { product: result.product });
    },
    [navigation, route.params?.compareSlot, route.params?.reuseProduct],
  );

  useFocusEffect(
    useCallback(() => {
      requestActive.current = true;
      lock.current = false;
      lastCode.current = null;
      setPhase('ready');
      setFailure(null);
      return () => {
        requestActive.current = false;
      };
    }, []),
  );

  useEffect(() => {
    if (route.params?.openManual) {
      setManualOpen(true);
    }
  }, [route.params?.openManual, route.params?.requestId]);

  async function onBarcodeScanned(scan: { data: string }) {
    if (lock.current) {
      return;
    }
    const code = normalizeScannedBarcode(scan.data);
    if (!code || code === lastCode.current) {
      return;
    }
    await runLookup(code);
  }

  const copy = failure ? LOOKUP_COPY[failure] : null;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {focused && permission?.granted && !cameraFailed && phase === 'ready' ? (
        <CameraView
          facing="back"
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
          onBarcodeScanned={onBarcodeScanned}
          onMountError={() => setCameraFailed(true)}
        />
      ) : (
        <View style={styles.fallback} />
      )}
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.overlay}>
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <AppHeader />
        </View>
        <View style={styles.middle}>
          {!permission ? (
            <StateMessage title="Checking camera access" body="One moment while we see whether the camera can be used." />
          ) : null}
          {permission && !permission.granted ? (
            <StateMessage
              title={permission.canAskAgain ? 'Camera access is needed' : 'Camera access is off'}
              body={
                permission.canAskAgain
                  ? 'IngreCheck reads barcodes on your device. Photos are not uploaded. You can also type a barcode.'
                  : 'Camera access is off. To scan, allow the camera in Settings. You can also type a barcode. Photos are not uploaded.'
              }
              actions={
                permission.canAskAgain
                  ? [{ label: 'Allow camera', onPress: () => requestPermission() }]
                  : [
                      { label: 'Open Settings', onPress: () => Linking.openSettings() },
                      { label: 'Enter a barcode', onPress: () => setManualOpen(true), variant: 'secondary' },
                    ]
              }
            />
          ) : null}
          {permission?.granted && cameraFailed ? (
            <StateMessage
              title="Camera unavailable"
              body="This device or simulator could not open the camera. Type the barcode instead. A physical phone camera is more reliable than the simulator."
              actions={[{ label: 'Enter a barcode', onPress: () => setManualOpen(true) }]}
            />
          ) : null}
          {permission?.granted && !cameraFailed && phase === 'ready' ? (
            <View style={styles.frameWrap}>
              <View style={styles.frame} />
              <Text style={styles.instruction}>Align the barcode inside the frame.</Text>
            </View>
          ) : null}
          {phase === 'loading' ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>Looking up this product…</Text>
            </View>
          ) : null}
          {phase === 'error' && copy ? (
            <StateMessage
              title={copy.title}
              body={copy.body}
              tone={failure === 'not_found' ? 'warning' : 'error'}
              actions={[
                {
                  label: 'Try again',
                  onPress: () => {
                    if (lastCode.current) {
                      void runLookup(lastCode.current);
                    }
                  },
                },
                { label: 'Enter a barcode', onPress: () => setManualOpen(true), variant: 'secondary' },
              ]}
            />
          ) : null}
        </View>
        <View style={styles.bottom}>
          {phase !== 'loading' ? (
            <>
              <Button label="Enter a barcode" onPress={() => setManualOpen(true)} variant="secondary" />
              <Text style={styles.simulatorNote}>
                On a simulator, type the barcode. A phone camera is the reliable way to scan.
              </Text>
            </>
          ) : null}
        </View>
        <AppFooter />
      </SafeAreaView>
      <ManualBarcodeModal visible={manualOpen} onClose={() => setManualOpen(false)} onSubmit={(code) => void runLookup(code)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  fallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.primary,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    backgroundColor: colors.white,
  },
  middle: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  frameWrap: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  frame: {
    width: 260,
    height: 160,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderColor: colors.mint,
    backgroundColor: 'transparent',
  },
  instruction: {
    ...type.body,
    color: colors.white,
    textAlign: 'center',
  },
  loadingCard: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...type.body,
    color: colors.text,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  simulatorNote: {
    ...type.caption,
    color: colors.mint,
    textAlign: 'center',
  },
});
