import { parseNovaGroup, NOVA_DESCRIPTIONS } from '../nova';

describe('NOVA classification', () => {
  it('describes groups 1 through 4 and ignores anything else', () => {
    expect(parseNovaGroup(1)).toBe(1);
    expect(parseNovaGroup('4')).toBe(4);
    expect(NOVA_DESCRIPTIONS[1]).toBe('Unprocessed or minimally processed foods.');
    expect(NOVA_DESCRIPTIONS[2]).toBe('Processed culinary ingredients.');
    expect(NOVA_DESCRIPTIONS[3]).toBe('Processed foods.');
    expect(NOVA_DESCRIPTIONS[4]).toBe('Ultra-processed foods.');
    expect(parseNovaGroup(0)).toBeNull();
    expect(parseNovaGroup(5)).toBeNull();
    expect(parseNovaGroup(null)).toBeNull();
    expect(parseNovaGroup('ultra')).toBeNull();
  });
});
