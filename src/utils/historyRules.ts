export const HISTORY_PAGE_SIZE = 20;
export const HISTORY_DEDUPE_MS = 15 * 60 * 1000;

export function shouldRecordScan(lastScannedAt: string | null, now: number): boolean {
  if (!lastScannedAt) {
    return true;
  }
  const previous = Date.parse(lastScannedAt);
  if (Number.isNaN(previous)) {
    return true;
  }
  return now - previous >= HISTORY_DEDUPE_MS;
}

export function formatScanTime(iso: string, now: number): string {
  const scanned = Date.parse(iso);
  if (Number.isNaN(scanned)) {
    return 'Unknown time';
  }
  const minutes = Math.max(0, Math.round((now - scanned) / 60000));
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  return new Date(scanned).toLocaleDateString();
}
