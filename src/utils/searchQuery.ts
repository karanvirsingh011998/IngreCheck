const MAX_QUERY_LENGTH = 80;

/** Lucene operators would change the query. Replace them so the words are searched as text. */
function plainText(value: string): string {
  return value.replace(/[+\-!(){}[\]^"~*?:\\/&|]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function normalizeSearchQuery(input: string): string | null {
  const query = plainText(input).slice(0, MAX_QUERY_LENGTH).trim();
  return query.length > 0 ? query : null;
}
