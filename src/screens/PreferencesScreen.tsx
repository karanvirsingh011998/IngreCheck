import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import {
  addPreference,
  listPreferences,
  removePreference,
  SIGN_IN_TO_SAVE,
  updatePreference,
  type IngredientPreference,
} from '../services/cloud';
import { colors, radius, spacing, type } from '../theme';
import type { PreferencesScreenProps } from '../types/navigation';
import { validatePreference, type PreferenceType } from '../utils/preferences';

export function PreferencesScreen({ navigation }: PreferencesScreenProps) {
  const { profile } = useAuth();
  const [items, setItems] = useState<IngredientPreference[]>([]);
  const [name, setName] = useState('');
  const [preferenceType, setPreferenceType] = useState<PreferenceType>('avoid');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const result = await listPreferences();
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setItems(result.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (profile) {
        void load();
      }
    }, [load, profile]),
  );

  async function save() {
    const draft = validatePreference(name, preferenceType);
    if ('error' in draft) {
      setMessage(draft.error);
      return;
    }
    setSaving(true);
    const result = editingId
      ? await updatePreference(editingId, draft.ingredientName, draft.preferenceType)
      : await addPreference(draft.ingredientName, draft.preferenceType);
    setSaving(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setName('');
    setEditingId(null);
    setMessage(null);
    await load();
  }

  function beginEdit(item: IngredientPreference) {
    setEditingId(item.id);
    setName(item.ingredientName);
    setPreferenceType(item.preferenceType);
    setMessage(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Ingredient preferences</Text>
        <Text style={styles.body}>
          Add names you want to avoid or monitor. A product page flags an exact name match. This is your list, not an
          allergen check.
        </Text>
        {!profile ? (
          <View style={styles.stack}>
            <Text style={styles.body}>{SIGN_IN_TO_SAVE}</Text>
            <Button label="Sign in" onPress={() => navigation.navigate('SignIn')} />
          </View>
        ) : (
          <View style={styles.stack}>
            <TextInput
              accessibilityLabel="Ingredient name"
              autoCapitalize="none"
              onChangeText={setName}
              placeholder="Ingredient name"
              placeholderTextColor={colors.secondary}
              style={styles.input}
              value={name}
            />
            <View style={styles.row}>
              <Choice label="Avoid" selected={preferenceType === 'avoid'} onPress={() => setPreferenceType('avoid')} />
              <Choice
                label="Monitor"
                selected={preferenceType === 'monitor'}
                onPress={() => setPreferenceType('monitor')}
              />
            </View>
            <Button label={editingId ? 'Update preference' : 'Add preference'} loading={saving} onPress={() => void save()} />
            {editingId ? (
              <Button
                label="Cancel edit"
                onPress={() => {
                  setEditingId(null);
                  setName('');
                }}
                variant="ghost"
              />
            ) : null}
          </View>
        )}
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.name}>{item.ingredientName}</Text>
            <Text style={styles.caption}>{item.preferenceType === 'avoid' ? 'Avoid' : 'Monitor'}</Text>
            <View style={styles.row}>
              <Button label="Edit" onPress={() => beginEdit(item)} variant="secondary" />
              <Button
                label="Remove"
                onPress={() => {
                  void removePreference(item.id).then((result) => {
                    if (!result.ok) {
                      setMessage(result.message);
                      return;
                    }
                    setItems((current) => current.filter((entry) => entry.id !== item.id));
                  });
                }}
                variant="ghost"
              />
            </View>
          </View>
        ))}
        {message ? <Text style={styles.error}>{message}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  top: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  back: { ...type.label, color: colors.primary, minHeight: 44 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  title: { ...type.display, color: colors.primary },
  stack: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
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
  choice: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  choiceSelected: { backgroundColor: colors.mint, borderColor: colors.fresh },
  choiceText: { ...type.label, color: colors.secondary },
  choiceTextSelected: { color: colors.primary },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  name: { ...type.label, color: colors.text },
  body: { ...type.body, color: colors.secondary },
  caption: { ...type.caption, color: colors.secondary },
  error: { ...type.caption, color: colors.error },
});
