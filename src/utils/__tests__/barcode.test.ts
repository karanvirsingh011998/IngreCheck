import { hasValidCheckDigit, normalizeScannedBarcode, validateManualBarcode } from '../barcode';

describe('barcode validation', () => {
  it('accepts a valid EAN-13, UPC-A, and EAN-8', () => {
    expect(validateManualBarcode('3017620422003')).toEqual({ ok: true, code: '3017620422003' });
    expect(validateManualBarcode('036000291452')).toEqual({ ok: true, code: '036000291452' });
    expect(validateManualBarcode('96385074')).toEqual({ ok: true, code: '96385074' });
  });

  it('trims whitespace before validating', () => {
    expect(validateManualBarcode('  3017620422003  ')).toEqual({ ok: true, code: '3017620422003' });
  });

  it('rejects empty, non-numeric, wrong length, and bad check digits', () => {
    expect(validateManualBarcode('   ').ok).toBe(false);
    expect(validateManualBarcode('301762042200A').ok).toBe(false);
    expect(validateManualBarcode('12345').ok).toBe(false);
    expect(validateManualBarcode('3017620422004').ok).toBe(false);
    expect(hasValidCheckDigit('3017620422004')).toBe(false);
  });

  it('keeps a scanned retail code that the camera already recognized', () => {
    expect(normalizeScannedBarcode(' 3017620422003 ')).toBe('3017620422003');
    expect(normalizeScannedBarcode('123456')).toBe('123456');
    expect(normalizeScannedBarcode('not-a-code')).toBeNull();
  });
});
