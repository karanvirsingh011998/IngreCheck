import { HISTORY_DEDUPE_MS, shouldRecordScan } from '../historyRules';

describe('scan history dedupe', () => {
  const now = Date.parse('2026-10-09T12:00:00.000Z');

  it('records the first scan of a barcode', () => {
    expect(shouldRecordScan(null, now)).toBe(true);
  });

  it('skips a repeat inside 15 minutes', () => {
    const recent = new Date(now - HISTORY_DEDUPE_MS + 1000).toISOString();
    expect(shouldRecordScan(recent, now)).toBe(false);
  });

  it('records the same barcode again after 15 minutes', () => {
    const older = new Date(now - HISTORY_DEDUPE_MS).toISOString();
    expect(shouldRecordScan(older, now)).toBe(true);
  });

  it('records again when the saved time cannot be read', () => {
    expect(shouldRecordScan('not-a-time', now)).toBe(true);
  });
});
