import { productPageUrl } from '../config/openFoodFacts';
import type { ExplainedIngredient } from '../types/ingredient';
import type { LookupFailureCode, LookupResult, Product } from '../types/product';
import { formatTag, summarizeAllergens } from './allergens';
import { matchIngredient, normalizeIngredientName, splitIngredientText } from './matchIngredient';
import { parseNovaGroup } from './nova';
import { buildNutrition, extractComparableNutrition } from './nutrition';
import { LOOKUP_COPY } from './lookupCopy';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readImageUrl(value: unknown): string | null {
  const url = readString(value);
  if (!url || !/^https?:\/\//i.test(url)) {
    return null;
  }
  return url;
}

type SourceIngredient = {
  id: string | null;
  text: string;
};

function flattenIngredients(value: unknown): SourceIngredient[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const items: SourceIngredient[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }
    const children = flattenIngredients(entry.ingredients);
    if (children.length > 0) {
      items.push(...children);
      continue;
    }
    const text = readString(entry.text);
    if (!text) {
      continue;
    }
    items.push({ id: readString(entry.id), text });
  }
  return items;
}

function explain(items: SourceIngredient[]): ExplainedIngredient[] {
  return items.map((item) => ({
    text: item.text,
    sourceId: item.id,
    match: matchIngredient({ id: item.id, name: item.text }),
  }));
}

function countriesFrom(product: Record<string, unknown>): string | null {
  const countries = readString(product.countries);
  if (countries) {
    return countries;
  }
  if (!Array.isArray(product.countries_tags)) {
    return null;
  }
  const labels = product.countries_tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.replace(/^en:/, '').replace(/-/g, ' '))
    .filter((tag) => tag.length > 0);
  return labels.length > 0 ? labels.join(', ') : null;
}

function tagLabels(value: unknown, englishOnly: boolean): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const labels = value
    .filter((tag): tag is string => typeof tag === 'string')
    .filter((tag) => !englishOnly || tag.toLowerCase().startsWith('en:'))
    .map((tag) => formatTag(tag.replace(/^[a-z]{2}:/i, 'en:')))
    .filter((label): label is string => Boolean(label));
  return [...new Set(labels)];
}

function textList(value: unknown): string[] {
  const text = readString(value);
  if (!text) {
    return [];
  }
  return text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function allergenSource(tags: unknown, text: unknown): unknown {
  if (Array.isArray(tags) && tags.length > 0) {
    return tags;
  }
  const parts = textList(text);
  return parts.length > 0 ? parts : tags;
}

function nutritionGrade(value: unknown): string | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const grade = value.find((item) => typeof item === 'string' && item.trim().length > 0);
  return typeof grade === 'string' ? grade.trim().toUpperCase() : null;
}

function updatedLabel(value: unknown): string | null {
  const seconds = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : null;
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function failure(code: LookupFailureCode): LookupResult {
  return { ok: false, code, message: LOOKUP_COPY[code].body };
}

export function parseProductResponse(body: unknown): LookupResult {
  if (!isRecord(body)) {
    return failure('malformed');
  }

  const resultId = isRecord(body.result) ? readString(body.result.id) : null;
  if (resultId === 'product_not_found' || body.status === 'product_not_found') {
    return failure('not_found');
  }

  const product = body.product;
  if (!isRecord(product)) {
    if (body.status === 'failure' || body.status === 'error') {
      return failure(resultId?.includes('not_found') ? 'not_found' : 'server');
    }
    return failure('malformed');
  }

  const code = readString(product.code) ?? readString(body.code);
  if (!code) {
    return failure('malformed');
  }

  const originalIngredients = readString(product.ingredients_text);
  const englishIngredients = readString(product.ingredients_text_en);
  const ingredientsText = originalIngredients ?? englishIngredients;
  const ingredientsTextEn =
    originalIngredients &&
    englishIngredients &&
    normalizeIngredientName(originalIngredients) !== normalizeIngredientName(englishIngredients)
      ? englishIngredients
      : null;
  const structured = flattenIngredients(product.ingredients);
  const sourceIngredients =
    structured.length > 0
      ? structured
      : ingredientsText
        ? splitIngredientText(ingredientsText).map((text) => ({ id: null, text }))
        : [];
  const allergenSummary = summarizeAllergens(
    allergenSource(product.allergens_tags, product.allergens),
    allergenSource(product.traces_tags, product.traces),
  );
  const nutrition = buildNutrition(product.nutriments, product.nutrition_data_per);
  const categoryTags = tagLabels(product.categories_tags, true).slice(0, 3).join(', ');

  const normalized: Product = {
    code,
    name: readString(product.product_name) ?? 'Unnamed product',
    brands: readString(product.brands),
    imageUrl: readImageUrl(product.image_front_url),
    categories: readString(product.categories) ?? (categoryTags || null),
    countries: countriesFrom(product),
    ingredientsText,
    ingredientsTextEn,
    ingredients: explain(sourceIngredients),
    quantity: readString(product.quantity),
    recordedLabels: tagLabels(product.labels_tags, true),
    nutritionGrade: nutritionGrade(product.nutrition_grades_tags),
    nutritionBasis: nutrition.basis,
    nutrition: nutrition.rows,
    comparableNutrition: extractComparableNutrition(product.nutriments, product.nutrition_data_per),
    allergens: allergenSummary.allergens,
    traces: allergenSummary.traces,
    allergenStatus: allergenSummary.status,
    novaGroup: parseNovaGroup(product.nova_group),
    sourceUrl: productPageUrl(code),
    lastUpdated: updatedLabel(product.last_modified_t),
  };

  return { ok: true, product: normalized };
}
