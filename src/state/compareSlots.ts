import type { Product } from '../types/product';

export type CompareSlotId = 'a' | 'b';

type CompareSlots = {
  a: Product | null;
  b: Product | null;
};

let slots: CompareSlots = { a: null, b: null };

export function readCompareSlots(): CompareSlots {
  return slots;
}

export function saveCompareSlot(slot: CompareSlotId, product: Product | null): CompareSlots {
  slots = { ...slots, [slot]: product };
  return slots;
}

export function clearCompareSlots(): CompareSlots {
  slots = { a: null, b: null };
  return slots;
}
