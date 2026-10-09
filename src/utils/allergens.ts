import type { AllergenStatus } from '../types/product';

const ALLERGEN_NOTE =
  'If you have an allergy, check the current package label. Missing allergen information does not mean a product is allergen-free.';

export function allergenNote(): string {
  return ALLERGEN_NOTE;
}

export function formatTag(tag: string): string | null {
  const cleaned = tag.trim().toLowerCase().replace(/^en:/, '').replace(/-/g, ' ');
  if (!cleaned) {
    return null;
  }
  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function uniqueLabels(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }
  const labels = tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => formatTag(tag))
    .filter((label): label is string => Boolean(label));
  return [...new Set(labels)];
}

export function summarizeAllergens(allergenTags: unknown, traceTags: unknown): {
  allergens: string[];
  traces: string[];
  status: AllergenStatus;
} {
  const allergens = uniqueLabels(allergenTags);
  const traces = uniqueLabels(traceTags).filter((trace) => !allergens.includes(trace));
  let status: AllergenStatus = 'missing';
  if (allergens.length > 0) {
    status = 'listed';
  } else if (traces.length > 0) {
    status = 'traces_only';
  }
  return { allergens, traces, status };
}
