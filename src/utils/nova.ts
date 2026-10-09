import type { NovaGroup } from '../types/product';

export const NOVA_DESCRIPTIONS: Record<NovaGroup, string> = {
  1: 'Unprocessed or minimally processed foods.',
  2: 'Processed culinary ingredients.',
  3: 'Processed foods.',
  4: 'Ultra-processed foods.',
};

export const NOVA_CAVEAT =
  'This classification comes from the available product data and may be missing or incomplete.';

export function parseNovaGroup(value: unknown): NovaGroup | null {
  const group = typeof value === 'number' ? value : typeof value === 'string' && /^\d$/.test(value) ? Number(value) : null;
  if (group === 1 || group === 2 || group === 3 || group === 4) {
    return group;
  }
  return null;
}
