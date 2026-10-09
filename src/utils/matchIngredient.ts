import type { IngredientEntry, IngredientMatch } from '../types/ingredient';
import { INGREDIENTS } from '../data/ingredients';

export const UNKNOWN_INGREDIENT_MESSAGE =
  'Ingredient information is limited. We could not confidently identify this ingredient.';

export const UNCERTAIN_INGREDIENT_MESSAGE =
  'This name could match more than one ingredient, so we are not forcing an explanation.';

export function normalizeIngredientName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(/\d+(?:[.,]\d+)?\s*%/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lookupKeys(value: string): string[] {
  const normalized = normalizeIngredientName(value.replace(/^[a-z][a-z\s-]{0,40}:\s*/i, ''));
  if (!normalized) {
    return [];
  }
  const compact = normalized.replace(/\s+/g, '');
  return compact === normalized ? [normalized] : [normalized, compact];
}

function entryKeys(entry: IngredientEntry): string[] {
  return [entry.name, ...entry.synonyms].flatMap((name) => lookupKeys(name));
}

export function matchIngredient(
  query: { id?: string | null; name: string },
  entries: readonly IngredientEntry[] = INGREDIENTS,
): IngredientMatch {
  const sourceId = query.id?.trim().toLowerCase();
  if (sourceId) {
    const byId = entries.filter((entry) => entry.offIds.some((offId) => offId.toLowerCase() === sourceId));
    if (byId.length === 1) {
      return { status: 'matched', entry: byId[0] };
    }
    if (byId.length > 1) {
      return { status: 'uncertain' };
    }
  }

  const keys = lookupKeys(query.name);
  if (keys.length === 0) {
    return { status: 'unknown' };
  }

  const matches = entries.filter((entry) => entryKeys(entry).some((key) => keys.includes(key)));
  if (matches.length === 1) {
    return { status: 'matched', entry: matches[0] };
  }
  if (matches.length > 1) {
    return { status: 'uncertain' };
  }
  return { status: 'unknown' };
}

export function splitIngredientText(text: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depth = 0;

  for (const character of text) {
    if (character === '(' || character === '[') {
      depth += 1;
    } else if (character === ')' || character === ']') {
      depth = Math.max(0, depth - 1);
    }

    if ((character === ',' || character === ';') && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) {
        parts.push(trimmed);
      }
      current = '';
      continue;
    }
    current += character;
  }

  const trimmed = current.trim().replace(/[.\s]+$/g, '');
  if (trimmed) {
    parts.push(trimmed);
  }
  return parts;
}
