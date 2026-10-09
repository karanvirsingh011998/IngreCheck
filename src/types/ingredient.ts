export type IngredientLabel =
  | 'Common food ingredient'
  | 'Preservative'
  | 'Sweetener'
  | 'Function explained'
  | 'More information needed';

export type EvidenceStatus = 'established' | 'needs_verification';

export type IngredientSource = {
  title: string;
  url: string;
};

export type IngredientEntry = {
  id: string;
  name: string;
  synonyms: string[];
  offIds: string[];
  category: string;
  label: IngredientLabel;
  explanation: string;
  whyUsed: string;
  consideration: string;
  sources: IngredientSource[];
  evidence: EvidenceStatus;
  ambiguity: string | null;
};

export type IngredientMatch =
  | { status: 'matched'; entry: IngredientEntry }
  | { status: 'uncertain' }
  | { status: 'unknown' };

export type ExplainedIngredient = {
  text: string;
  sourceId: string | null;
  match: IngredientMatch;
};
