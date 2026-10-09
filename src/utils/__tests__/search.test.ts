import { searchApiUrl } from '../../config/openFoodFacts';
import { REPORT_NOT_SENT } from '../../content/help';
import { DELETE_ACCOUNT_FALLBACK } from '../../services/cloud';
import { cameraAccessCopy } from '../cameraAccess';
import { parseSearchResponse } from '../normalizeSearch';
import { normalizeSearchQuery } from '../searchQuery';

describe('product search query', () => {
  it('rejects an empty query', () => {
    expect(normalizeSearchQuery('   ')).toBeNull();
    expect(normalizeSearchQuery('+++')).toBeNull();
  });

  it('keeps a name or brand and drops search operators', () => {
    expect(normalizeSearchQuery('  Amul butter  ')).toBe('Amul butter');
    expect(normalizeSearchQuery('milk AND (bread)')).toBe('milk AND bread');
  });

  it('builds the Search-a-licious URL', () => {
    const url = searchApiUrl('amul', 2);
    expect(url.startsWith('https://search.openfoodfacts.org/search?')).toBe(true);
    expect(url).toContain('q=amul');
    expect(url).toContain('page=2');
    expect(url).toContain('page_size=20');
    expect(url).toContain('product_name');
  });
});

describe('search response parsing', () => {
  it('reads a result with a missing name and a brand list', () => {
    const page = parseSearchResponse(
      {
        hits: [{ code: '8901262010320', brands: ['AMUL'], quantity: '200gm', product_name: '' }],
        page: 1,
        page_count: 3,
      },
      1,
    );
    expect(page?.hits[0]).toEqual({
      code: '8901262010320',
      name: null,
      brands: 'AMUL',
      quantity: '200gm',
      imageUrl: null,
    });
    expect(page?.pageCount).toBe(3);
  });

  it('treats an empty hit list as a successful page', () => {
    expect(parseSearchResponse({ hits: [], page: 1, page_count: 0 }, 1)).toEqual({
      hits: [],
      page: 1,
      pageCount: 0,
    });
  });

  it('rejects a malformed body', () => {
    expect(parseSearchResponse({ products: [] }, 1)).toBeNull();
    expect(parseSearchResponse(null, 1)).toBeNull();
  });
});

describe('camera access', () => {
  it('asks once when the system can still prompt', () => {
    expect(cameraAccessCopy(true).next).toBe('allow');
  });

  it('sends the user to Settings when the prompt is no longer available', () => {
    expect(cameraAccessCopy(false).next).toBe('settings');
    expect(cameraAccessCopy(false).body).toContain('Settings');
  });
});

describe('reports and account deletion', () => {
  it('does not describe an unsent report as delivered', () => {
    expect(REPORT_NOT_SENT).toContain('does not send');
    expect(REPORT_NOT_SENT.toLowerCase()).not.toContain('successfully');
  });

  it('does not describe a failed account deletion as complete', () => {
    expect(DELETE_ACCOUNT_FALLBACK.toLowerCase()).toContain('could not delete');
    expect(DELETE_ACCOUNT_FALLBACK.toLowerCase()).not.toContain('has been deleted');
  });
});
