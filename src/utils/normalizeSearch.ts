import { SEARCH_PAGE_SIZE } from '../config/openFoodFacts';

export type SearchHit = {
  code: string;
  name: string | null;
  brands: string | null;
  quantity: string | null;
  imageUrl: string | null;
};

export type SearchPage = {
  hits: SearchHit[];
  page: number;
  pageCount: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function textValue(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
    return parts.length > 0 ? parts.join(', ') : null;
  }
  return null;
}

function hitFrom(value: unknown): SearchHit | null {
  if (!isRecord(value)) {
    return null;
  }
  const code = textValue(value.code);
  if (!code) {
    return null;
  }
  return {
    code,
    name: textValue(value.product_name),
    brands: textValue(value.brands),
    quantity: textValue(value.quantity),
    imageUrl: textValue(value.image_front_small_url) ?? textValue(value.image_front_url),
  };
}

export function parseSearchResponse(body: unknown, requestedPage: number): SearchPage | null {
  if (!isRecord(body) || !Array.isArray(body.hits)) {
    return null;
  }
  const hits = body.hits.map(hitFrom).filter((hit): hit is SearchHit => hit !== null);
  const page = typeof body.page === 'number' && body.page > 0 ? body.page : requestedPage;
  let pageCount = typeof body.page_count === 'number' && body.page_count >= 0 ? body.page_count : null;
  if (pageCount === null) {
    pageCount = hits.length < SEARCH_PAGE_SIZE ? page : page + 1;
  }
  return { hits, page, pageCount };
}
