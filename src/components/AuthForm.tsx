import { useState } from 'react';
import {
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
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, type } from '../theme';
import { validateEmail, validatePassword } from '../utils/authValidation';

type Mode = 'sign-in' | 'sign-up';

type Props = {
  mode: Mode;
  onSwitch: () => void;
  onSuccess: () => void;
};

export function AuthForm({ mode, onSwitch, onSuccess }: Props) {
  const { signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setError(emailError ?? passwordError);
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    const result = mode === 'sign-in' ? await signInWithEmail(email, password) : await signUpWithEmail(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (result.needsEmailConfirmation) {
      setNotice('Check your email to confirm your account. You can keep scanning without signing in.');
      return;
    }
    onSuccess();
  }

  async function resetPassword() {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await sendPasswordReset(email);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setNotice('If this email can receive mail from us, a reset link is on its way.');
  }

  return (
    <AppShell>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{mode === 'sign-in' ? 'Sign in' : 'Create account'}</Text>
          <Text style={styles.body}>Use the email and password for your optional IngreCheck profile.</Text>
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.secondary}
            style={styles.input}
            value={email}
          />
          <TextInput
            accessibilityLabel="Password"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.secondary}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {notice ? <Text style={styles.notice}>{notice}</Text> : null}
          <Button label={mode === 'sign-in' ? 'Sign in' : 'Create account'} loading={loading} onPress={() => void submit()} />
          {mode === 'sign-in' ? (
            <Button label="Forgot password" onPress={() => void resetPassword()} variant="ghost" />
          ) : null}
          <View style={styles.switchRow}>
            <Text style={styles.body}>{mode === 'sign-in' ? 'New here?' : 'Already have an account?'}</Text>
            <Pressable accessibilityRole="button" onPress={onSwitch}>
              <Text style={styles.link}>{mode === 'sign-in' ? 'Create account' : 'Sign in'}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
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
  notice: {
    ...type.body,
    color: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  link: {
    ...type.label,
    color: colors.fresh,
  },
});
