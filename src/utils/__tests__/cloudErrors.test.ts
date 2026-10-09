import { mapCloudError } from '../cloudErrors';

describe('favorite duplicate handling', () => {
  it('reports a unique-constraint failure as a duplicate', () => {
    const result = mapCloudError({ code: '23505', message: 'duplicate key value violates unique constraint' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('duplicate');
    }
  });

  it('does not treat a network failure as a saved favorite', () => {
    const result = mapCloudError({ message: 'Network request failed' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('network');
    }
  });
});
