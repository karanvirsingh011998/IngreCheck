export type BarcodeValidation =
  | { ok: true; code: string }
  | { ok: false; message: string };

function checkDigit(code: string): number {
  const digits = code.split('').map((digit) => Number(digit));
  const payload = digits.slice(0, -1);
  let sum = 0;
  // GS1 weights alternate from the right, starting with 3 on the digit beside the check digit.
  for (let index = 0; index < payload.length; index += 1) {
    const fromRight = payload.length - index;
    const weight = fromRight % 2 === 1 ? 3 : 1;
    sum += payload[index] * weight;
  }
  return (10 - (sum % 10)) % 10;
}

export function hasValidCheckDigit(code: string): boolean {
  if (!/^\d{8}$|^\d{12}$|^\d{13}$/.test(code)) {
    return false;
  }
  return checkDigit(code) === Number(code[code.length - 1]);
}

export function validateManualBarcode(input: string): BarcodeValidation {
  const code = input.trim().replace(/\s+/g, '');
  if (!code) {
    return { ok: false, message: 'Enter a barcode.' };
  }
  if (!/^\d+$/.test(code)) {
    return { ok: false, message: 'Use numbers only.' };
  }
  if (code.length !== 8 && code.length !== 12 && code.length !== 13) {
    return { ok: false, message: 'Enter an 8, 12, or 13 digit barcode.' };
  }
  if (!hasValidCheckDigit(code)) {
    return { ok: false, message: 'That barcode check digit does not look right. Check the package and try again.' };
  }
  return { ok: true, code };
}

export function normalizeScannedBarcode(input: string): string | null {
  const code = input.trim().replace(/\s+/g, '');
  if (!/^\d{6,14}$/.test(code)) {
    return null;
  }
  return code;
}
