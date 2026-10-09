export const LEGAL_REVIEW_NOTE =
  'Draft for review. A lawyer has not approved this text. Replace every placeholder in square brackets before you publish it. This draft does not claim compliance with any privacy law or store policy.';

export const PRIVACY_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'Who this describes',
    body: 'IngreCheck is operated by [YOUR NAME OR ORGANISATION]. Privacy questions go to [PRIVACY CONTACT EMAIL]. This draft describes the app as built. It is not a promise of legal compliance.',
  },
  {
    heading: 'Product lookups',
    body: 'When you scan or type a barcode, the app sends that barcode to Open Food Facts and receives product information. The app does not upload a photo of the barcode. Open Food Facts is a separate service with its own policies.',
  },
  {
    heading: 'Accounts',
    body: 'An account is optional. If you create one, Supabase Auth stores your email address and the sign-in method you use, such as email, Google, or Apple. The app can also store a display name you choose. Passwords are handled by Supabase Auth. The app does not keep a copy of your password in its own storage.',
  },
  {
    heading: 'Saved data',
    body: 'If you are signed in, the app can store scan history, favorite products, and ingredient preferences in Supabase. Those rows are tied to your account. They include barcodes and the product name, brand, and image address returned for that barcode. Comparison of two products is not saved to Supabase.',
  },
  {
    heading: 'On this device',
    body: 'The app remembers that you finished the introduction. It can keep a saved copy of a product lookup so a later open can show that copy when the network fails. Sign-in sessions are stored in the device secure storage. The app does not use an analytics or crash-reporting service.',
  },
  {
    heading: 'What we do not collect in the app',
    body: 'The current app does not include an advertising SDK, an analytics SDK, or a crash reporter. It does not ask for your contacts, location, or microphone.',
  },
  {
    heading: 'How long data stays',
    body: 'Scan history, favorites, preferences, and your profile stay until you delete them or delete the account, or until [YOUR NAME OR ORGANISATION] deletes the Supabase project. A saved product copy on the device stays until the app removes older copies or you remove the app. Onboarding completion stays on the device until you remove the app.',
  },
  {
    heading: 'Deleting an account',
    body: 'Profile includes Delete account. The app asks you to confirm, then asks Supabase to delete the signed-in user. Related history, favorites, preferences, and the profile are intended to be removed with that user. If deletion fails, the app says so and points you to the Supabase Authentication screen. Do not treat a failure message as a successful deletion.',
  },
  {
    heading: 'Security limits',
    body: 'No mobile app can promise that data will never be lost, delayed, or accessed by someone who compromises the device, the network, or the database host. The database policies are written so each account should see only its own rows. That separation still needs a test with two real accounts before you describe it as verified.',
  },
  {
    heading: 'Children',
    body: 'IngreCheck is not directed at children. Do not create an account for a child. [ADD ANY AGE LIMIT YOUR STORES OR COUNSEL REQUIRE.]',
  },
  {
    heading: 'Changes',
    body: 'If this notice changes, the published copy should show a new date. Effective date: [EFFECTIVE DATE].',
  },
];

export const TERMS_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'What IngreCheck is',
    body: 'IngreCheck shows food information it can retrieve for a barcode, plus short local notes about some ingredient names. It is an information tool. It is not a doctor, a dietitian, a laboratory, or a guarantee about a product.',
  },
  {
    heading: 'Product records can be wrong or old',
    body: 'Product details come from Open Food Facts and from the people who contribute to that database. A record can be missing, outdated, or different from the package you are holding. The app does not promise that every barcode will return a product.',
  },
  {
    heading: 'Allergens, nutrition, and processing',
    body: 'Missing allergen information does not mean a product is allergen-free. Missing nutrition values are not treated as zero. A NOVA group describes processing when the record includes one. It does not decide whether a food is healthy or suitable for you. Check the current package, especially if you have an allergy. For medical or dietary decisions, talk with a qualified professional.',
  },
  {
    heading: 'Your use',
    body: 'Use the app for personal lookup of packaged foods. Do not misuse the service, attempt to break into accounts, or present IngreCheck results as a safety certificate. You are responsible for decisions you make about food.',
  },
  {
    heading: 'Accounts',
    body: 'You may scan without an account. If you create an account, keep access to that email and device. You can sign out in Profile. Account deletion is described in the privacy draft.',
  },
  {
    heading: 'No paid subscription in this version',
    body: 'Any Premium screen in this version is information only. It does not complete a purchase.',
  },
  {
    heading: 'Availability',
    body: 'The app, Open Food Facts, and Supabase can be unavailable, slow, or changed. [YOUR NAME OR ORGANISATION] may change or stop the app.',
  },
  {
    heading: 'Liability limits need legal review',
    body: '[ADD ONLY LIMITS YOUR COUNSEL APPROVES. Do not use this draft to excuse misleading or unsafe behavior in the app.] These terms do not remove rights that the law of [COUNTRY] gives you and that cannot be waived.',
  },
  {
    heading: 'Contact',
    body: 'Questions about these terms: [PRIVACY CONTACT EMAIL]. Effective date: [EFFECTIVE DATE].',
  },
];
