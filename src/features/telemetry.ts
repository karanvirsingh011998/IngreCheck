/**
 * No analytics or crash reporter is connected.
 * Do not send email addresses, passwords, session tokens, barcodes, or scan history here.
 * A provider can be added later behind this function without changing call sites.
 */
export function recordEvent(_name: string, _properties?: Record<string, string | number | boolean>): void {
  return undefined;
}
