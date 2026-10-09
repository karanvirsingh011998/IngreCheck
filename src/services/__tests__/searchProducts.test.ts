import { searchProducts } from '../openFoodFacts';

function mockResponse(body: string, status: number) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => body,
  } as Response;
}

describe('searchProducts', () => {
  it('does not call the network for an empty query', async () => {
    const fetchImpl = jest.fn();
    await expect(searchProducts('   ', 1, fetchImpl)).resolves.toMatchObject({ ok: false, code: 'empty' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns matching products', async () => {
    const fetchImpl = jest.fn(async () =>
      mockResponse(
        JSON.stringify({
          hits: [{ code: '3017620422003', product_name: 'Nutella', brands: 'Ferrero', quantity: '400 g' }],
          page: 1,
          page_count: 2,
        }),
        200,
      ),
    );
    const result = await searchProducts('nutella', 1, fetchImpl);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.hits[0]?.code).toBe('3017620422003');
      expect(result.data.pageCount).toBe(2);
    }
    const calledUrl = (fetchImpl.mock.calls as unknown[][])[0]?.[0];
    expect(String(calledUrl)).toContain('https://search.openfoodfacts.org/search?');
  });

  it('returns no hits when the search matches nothing', async () => {
    const fetchImpl = jest.fn(async () => mockResponse(JSON.stringify({ hits: [], page: 1, page_count: 0 }), 200));
    const result = await searchProducts('zzzz-not-a-product', 1, fetchImpl);
    expect(result).toMatchObject({ ok: true, data: { hits: [], pageCount: 0 } });
  });

  it('returns a rate-limit error for 429 and 503 responses', async () => {
    const limited = jest.fn(async () => mockResponse('', 429));
    await expect(searchProducts('milk', 1, limited)).resolves.toMatchObject({ ok: false, code: 'rate_limit' });
    const busy = jest.fn(async () => mockResponse('', 503));
    await expect(searchProducts('milk', 1, busy)).resolves.toMatchObject({ ok: false, code: 'rate_limit' });
  });

  it('returns a network error when the request fails', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error('offline');
    });
    await expect(searchProducts('milk', 1, fetchImpl)).resolves.toMatchObject({ ok: false, code: 'network' });
  });

  it('returns malformed for an unexpected body', async () => {
    const fetchImpl = jest.fn(async () => mockResponse('<html>', 200));
    await expect(searchProducts('milk', 1, fetchImpl)).resolves.toMatchObject({ ok: false, code: 'malformed' });
  });
});
