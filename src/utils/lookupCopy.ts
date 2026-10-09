import type { LookupFailureCode } from '../types/product';

export const LOOKUP_COPY: Record<LookupFailureCode, { title: string; body: string }> = {
  not_found: {
    title: 'Product not found',
    body: 'Open Food Facts does not have this barcode yet. Check the code, or scan another product.',
  },
  network: {
    title: 'No internet connection',
    body: 'Check your connection and try the lookup again.',
  },
  timeout: {
    title: 'The lookup took too long',
    body: 'The product service did not respond in time. Please try again.',
  },
  malformed: {
    title: 'Unexpected product data',
    body: 'The response could not be read. Try again, or look up a different barcode.',
  },
  server: {
    title: 'Lookup failed',
    body: 'Open Food Facts could not complete this request. Please try again in a moment.',
  },
  rate_limit: {
    title: 'Please wait a moment',
    body: 'Open Food Facts limits how many products can be requested at once. Wait about a minute, then try again.',
  },
};
