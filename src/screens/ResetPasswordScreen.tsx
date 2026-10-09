import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, type } from '../theme';
import type { ResetPasswordScreenProps } from '../types/navigation';
import { validatePassword } from '../utils/authValidation';

export function ResetPasswordScreen({ navigation }: ResetPasswordScreenProps) {
  const { updatePassword, clearPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save() {
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    clearPasswordRecovery();
    navigation.navigate('Profile');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => {
            clearPasswordRecovery();
            navigation.goBack();
          }}
        >
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Choose a new password</Text>
        <Text style={styles.body}>Use at least 8 characters. This updates the optional profile on this device.</Text>
        <TextInput
          accessibilityLabel="New password"
          onChangeText={setPassword}
          placeholder="New password"
          placeholderTextColor={colors.secondary}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Save password" loading={loading} onPress={() => void save()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  back: {
    ...type.label,
    color: colors.primary,
    minHeight: 44,
  },
  title: {
    ...type.display,
    color: colors.primary,
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
