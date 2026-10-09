import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import { validateManualBarcode } from '../utils/barcode';
import { Button } from './Button';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
};

export function ManualBarcodeModal({ visible, onClose, onSubmit }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const result = validateManualBarcode(value);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    setValue('');
    onSubmit(result.code);
  }

  function close() {
    setError(null);
    onClose();
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={close}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable accessibilityLabel="Close barcode entry" style={styles.scrim} onPress={close} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Enter a barcode</Text>
          <Text style={styles.body}>Type the numbers printed under the barcode. Spaces are ignored.</Text>
          <TextInput
            accessibilityLabel="Barcode"
            autoCorrect={false}
            keyboardType="number-pad"
            onChangeText={(next) => {
              setValue(next);
              setError(null);
            }}
            placeholder="For example, 3017620422003"
            placeholderTextColor={colors.secondary}
            style={styles.input}
            value={value}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Look up product" onPress={submit} />
          <Button label="Cancel" onPress={close} variant="ghost" />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(32, 40, 32, 0.45)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    ...type.title,
    color: colors.text,
  },
  body: {
    ...type.body,
    color: colors.secondary,
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    ...type.body,
  },
  error: {
    ...type.caption,
    color: colors.error,
  },
});
