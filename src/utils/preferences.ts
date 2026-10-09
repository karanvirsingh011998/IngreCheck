import { normalizeIngredientName } from './matchIngredient';

export type PreferenceType = 'avoid' | 'monitor';

export type PreferenceDraft = {
  ingredientName: string;
  preferenceType: PreferenceType;
};

export function validatePreference(name: string, preferenceType: string): PreferenceDraft | { error: string } {
  const ingredientName = name.trim().replace(/\s+/g, ' ');
  if (!ingredientName) {
    return { error: 'Enter an ingredient name.' };
  }
  if (ingredientName.length > 80) {
    return { error: 'Use a shorter ingredient name.' };
  }
  if (preferenceType !== 'avoid' && preferenceType !== 'monitor') {
    return { error: 'Choose avoid or monitor.' };
  }
  return { ingredientName, preferenceType };
}

export type PreferenceFlag = {
  ingredientText: string;
  preferenceType: PreferenceType;
};

export function matchPreferenceFlags(
  ingredientTexts: readonly string[],
  preferences: readonly { ingredientName: string; preferenceType: PreferenceType }[],
): PreferenceFlag[] {
  const flags: PreferenceFlag[] = [];
  for (const text of ingredientTexts) {
    const normalized = normalizeIngredientName(text);
    if (!normalized) {
      continue;
    }
    const match = preferences.find((preference) => normalizeIngredientName(preference.ingredientName) === normalized);
    if (match) {
      flags.push({ ingredientText: text, preferenceType: match.preferenceType });
    }
  }
  return flags;
}

export function preferenceNote(preferenceType: PreferenceType): string {
  return preferenceType === 'avoid' ? 'You asked to avoid this.' : 'You asked to monitor this.';
}
