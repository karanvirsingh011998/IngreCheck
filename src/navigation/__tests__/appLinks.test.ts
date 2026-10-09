import { signedInFooterLinks, signedInMenuLinks, signedOutFooterLinks, signedOutMenuLinks } from '../appLinks';

describe('app links', () => {
  it('offers sign up, log in, and scan when signed out', () => {
    expect(signedOutMenuLinks.map((link) => link.destination)).toEqual(['SignUp', 'SignIn', 'Scanner', 'Compare']);
    expect(signedOutFooterLinks.map((link) => link.destination)).toEqual(['SignUp', 'SignIn', 'Scanner']);
  });

  it('offers the dashboard tools when signed in', () => {
    expect(signedInMenuLinks.map((link) => link.destination)).toEqual([
      'Home',
      'Scanner',
      'Compare',
      'Favorites',
      'ScanHistory',
      'Preferences',
      'Profile',
    ]);
    expect(signedInFooterLinks.map((link) => link.label)).toEqual([
      'Scan',
      'Compare',
      'Favorites',
      'History',
      'Profile',
    ]);
  });
});