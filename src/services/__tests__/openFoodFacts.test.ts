import { LOOKUP_TIMEOUT_MS } from '../../config/openFoodFacts';
import { lookupProduct } from '../openFoodFacts';

function mockResponse(body: string, status: number) {
  return {
    status,
    ok: status >= 200 && status < 300,
    text: async () => body,
  } as Response;
}

describe('product lookup', () => {
  it('returns not found for a 404 response', async () => {
    const fetchImpl = jest.fn(async () => mockResponse(JSON.stringify({ status: 'failure' }), 404));
    await expect(lookupProduct('0000000000000', fetchImpl)).resolves.toMatchObject({ ok: false, code: 'not_found' });
  });

  it('returns malformed when the body is not JSON', async () => {
    const fetchImpl = jest.fn(async () => mockResponse('<html>', 200));
    await expect(lookupProduct('3017620422003', fetchImpl)).resolves.toMatchObject({ ok: false, code: 'malformed' });
  });

  it('returns a rate-limit error for 429 and 503 responses', async () => {
    const limited = jest.fn(async () => mockResponse('', 429));
    await expect(lookupProduct('4290000000001', limited)).resolves.toMatchObject({ ok: false, code: 'rate_limit' });
    const busy = jest.fn(async () => mockResponse('', 503));
    await expect(lookupProduct('5030000000002', busy)).resolves.toMatchObject({ ok: false, code: 'rate_limit' });
  });

  it('returns a network error when the request fails', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error('network down');
    });
    await expect(lookupProduct('3017620422003', fetchImpl)).resolves.toMatchObject({ ok: false, code: 'network' });
  });

  it('returns a timeout when the request is aborted', async () => {
    jest.useFakeTimers();
    const fetchImpl = jest.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );
    const pending = lookupProduct('3017620422003', fetchImpl as typeof fetch);
    jest.advanceTimersByTime(LOOKUP_TIMEOUT_MS);
    await expect(pending).resolves.toMatchObject({ ok: false, code: 'timeout' });
    jest.useRealTimers();
  });
});
