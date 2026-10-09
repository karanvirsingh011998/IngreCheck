import { mapAuthError, validateEmail, validatePassword } from '../authValidation';
import { LOOKUP_COPY } from '../lookupCopy';

describe('auth validation and recovery copy', () => {
  it('checks email and password before they are sent', () => {
    expect(validateEmail('  ')).toMatch(/email/i);
    expect(validateEmail('not-an-email')).toMatch(/valid/i);
    expect(validateEmail('person@example.com')).toBeNull();
    expect(validatePassword('short')).toMatch(/8/);
    expect(validatePassword('long-enough')).toBeNull();
  });

  it('maps sign-in failures into plain language', () => {
    expect(mapAuthError('Invalid login credentials')).toMatch(/does not match/);
    expect(mapAuthError('User already registered')).toMatch(/already exists/);
    expect(mapAuthError('Email not confirmed')).toMatch(/Confirm your email/);
    expect(mapAuthError('Failed to fetch')).toMatch(/connection/);
  });

  it('has a recovery message for every lookup failure', () => {
    expect(LOOKUP_COPY.not_found.title).toBe('Product not found');
    expect(LOOKUP_COPY.network.body).toMatch(/connection/i);
    expect(LOOKUP_COPY.timeout.title).toMatch(/too long/);
    expect(LOOKUP_COPY.malformed.body.length).toBeGreaterThan(0);
    expect(LOOKUP_COPY.server.body.length).toBeGreaterThan(0);
  });
});
