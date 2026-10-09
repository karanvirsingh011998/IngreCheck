import { LOOKUP_TIMEOUT_MS, USER_AGENT, productApiUrl } from '../config/openFoodFacts';
import type { LookupResult } from '../types/product';
import { LOOKUP_COPY } from '../utils/lookupCopy';
import { parseProductResponse } from '../utils/normalizeProduct';

const recentLookups = new Map<string, { at: number; result: LookupResult }>();
const RECENT_LOOKUP_MS = 60_000;

function failure(code: 'network' | 'timeout' | 'malformed' | 'server' | 'not_found' | 'rate_limit'): LookupResult {
  return { ok: false, code, message: LOOKUP_COPY[code].body };
}

function remember(barcode: string, result: LookupResult): LookupResult {
  if (result.ok) {
    recentLookups.set(barcode, { at: Date.now(), result });
  }
  return result;
}

export async function lookupProduct(barcode: string, fetchImpl: typeof fetch = fetch): Promise<LookupResult> {
  const recent = recentLookups.get(barcode);
  if (recent && Date.now() - recent.at < RECENT_LOOKUP_MS) {
    return recent.result;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

  try {
    const response = await fetchImpl(productApiUrl(barcode), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
      signal: controller.signal,
    });

    if (response.status === 404) {
      return failure('not_found');
    }
    if (response.status === 429 || response.status === 503) {
      return failure('rate_limit');
    }

    const text = await response.text();
    let body: unknown;
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      return failure('malformed');
    }

    if (!response.ok) {
      const parsed = parseProductResponse(body);
      if (!parsed.ok && parsed.code === 'not_found') {
        return parsed;
      }
      return failure('server');
    }

    return remember(barcode, parseProductResponse(body));
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return failure('timeout');
    }
    return failure('network');
  } finally {
    clearTimeout(timer);
  }
}
