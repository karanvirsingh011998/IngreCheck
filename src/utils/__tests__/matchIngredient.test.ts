import type { IngredientEntry } from '../../types/ingredient';
import { matchIngredient, splitIngredientText } from '../matchIngredient';

const starchA: IngredientEntry = {
  id: 'a',
  name: 'Corn starch',
  synonyms: ['starch'],
  offIds: ['en:starch'],
  category: 'Other recognized ingredients',
  label: 'Common food ingredient',
  explanation: 'One starch.',
  whyUsed: 'Texture.',
  consideration: 'Ambiguous on its own.',
  sources: [],
  evidence: 'needs_verification',
  ambiguity: null,
};

const starchB: IngredientEntry = {
  ...starchA,
  id: 'b',
  name: 'Potato starch',
  offIds: ['en:potato-starch'],
};

describe('ingredient matching', () => {
  it('matches synonyms, E numbers, and taxonomy ids', () => {
    expect(matchIngredient({ name: 'E330' }).status).toBe('matched');
    expect(matchIngredient({ name: 'vitamin C' }).status).toBe('matched');
    expect(matchIngredient({ name: 'lécithines de soja', id: 'en:soya-lecithin' }).status).toBe('matched');
    const msg = matchIngredient({ name: 'MSG' });
    expect(msg.status).toBe('matched');
    if (msg.status === 'matched') {
      expect(msg.entry.id).toBe('monosodium-glutamate');
    }
  });

  it('does not treat glucose as glucose-fructose syrup', () => {
    const glucose = matchIngredient({ name: 'glucose' });
    const syrup = matchIngredient({ name: 'high-fructose corn syrup' });
    expect(glucose.status).toBe('matched');
    expect(syrup.status).toBe('matched');
    if (glucose.status === 'matched' && syrup.status === 'matched') {
      expect(glucose.entry.id).toBe('glucose');
      expect(syrup.entry.id).toBe('glucose-fructose-syrup');
    }
  });

  it('says when an ingredient cannot be identified', () => {
    const result = matchIngredient({ name: 'mystery dust 12%' });
    expect(result.status).toBe('unknown');
  });

  it('refuses an ambiguous name instead of forcing a match', () => {
    expect(matchIngredient({ name: 'starch' }, [starchA, starchB]).status).toBe('uncertain');
  });

  it('splits ingredient text without breaking parenthetical groups', () => {
    expect(splitIngredientText('sugar, emulsifiers (soy lecithin, sunflower lecithin), salt.')).toEqual([
      'sugar',
      'emulsifiers (soy lecithin, sunflower lecithin)',
      'salt',
    ]);
  });
});
