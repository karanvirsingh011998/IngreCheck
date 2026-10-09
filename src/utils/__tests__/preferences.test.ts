import { matchPreferenceFlags, preferenceNote, validatePreference } from '../preferences';

describe('ingredient preferences', () => {
  it('accepts avoid and monitor after trimming the name', () => {
    expect(validatePreference('  citric acid  ', 'avoid')).toEqual({
      ingredientName: 'citric acid',
      preferenceType: 'avoid',
    });
    expect(validatePreference('palm oil', 'monitor')).toEqual({
      ingredientName: 'palm oil',
      preferenceType: 'monitor',
    });
  });

  it('rejects an empty name or an unknown type', () => {
    expect(validatePreference('   ', 'avoid')).toEqual({ error: 'Enter an ingredient name.' });
    expect(validatePreference('salt', 'ban')).toEqual({ error: 'Choose avoid or monitor.' });
  });

  it('flags an exact normalized name and leaves similar names alone', () => {
    const flags = matchPreferenceFlags(
      ['Citric acid', 'glucose-fructose syrup'],
      [{ ingredientName: 'citric acid', preferenceType: 'avoid' }],
    );
    expect(flags).toEqual([{ ingredientText: 'Citric acid', preferenceType: 'avoid' }]);
    expect(preferenceNote('avoid')).toBe('You asked to avoid this.');
    expect(preferenceNote('monitor')).toBe('You asked to monitor this.');
  });
});
