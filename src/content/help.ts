export const HELP_SECTIONS: { heading: string; body: string }[] = [
  {
    heading: 'Barcode scanning',
    body: 'The scan screen reads a barcode with the camera, or you can type the code. The app sends that code to Open Food Facts and shows the record it returns. Photos of the barcode are not uploaded.',
  },
  {
    heading: 'Search without a barcode',
    body: 'Search Products sends the name or brand you type to Open Food Facts when you tap Search. It does not search on every letter. Choosing a result loads that product’s record. Many packaged foods in India are not in the database.',
  },
  {
    heading: 'Where the information comes from',
    body: 'Product names, ingredients, nutrition, allergens, traces, and NOVA groups come from Open Food Facts. Contributors add that data. IngreCheck does not verify it against the package in your hand.',
  },
  {
    heading: 'Missing information',
    body: 'A missing field is shown as not available. A missing ingredient list or allergen list does not mean the product has no ingredients or allergens. Nutrition values that are missing are not treated as zero.',
  },
  {
    heading: 'Ingredient preferences',
    body: 'A preference matches only when the same ingredient name appears in the recorded ingredient list. It cannot find every ingredient, and it does not mean a product is safe for you.',
  },
  {
    heading: 'Report incorrect information',
    body: 'The product screen can open the public Open Food Facts record. IngreCheck does not have its own reporting service, so it does not send or store a report.',
  },
  {
    heading: 'Contact',
    body: 'No support email is configured in this version. Privacy and terms drafts still contain placeholders and need review before a public contact address is published.',
  },
  {
    heading: 'Allergies',
    body: 'If you have an allergy, read the package you are holding. This app cannot confirm that a product is safe.',
  },
];

export const REPORT_NOT_SENT =
  'IngreCheck does not send this report. Nothing was submitted to IngreCheck or Open Food Facts from this screen.';

export const REPORT_ISSUES = [
  'Incorrect ingredients',
  'Incorrect nutrition values',
  'Incorrect product image',
  'Incorrect brand or product details',
  'Missing information',
  'Another data-quality issue',
] as const;

export const PREFERENCE_LIMIT_NOTE =
  'A match only happens when that name appears in the ingredient list Open Food Facts recorded. This cannot find every ingredient, and it does not mean a product is safe.';

export const FAVORITES_EMPTY =
  'No favorites yet. Save a product from its page after you scan or search.';

export const HISTORY_EMPTY = 'No saved scans yet. Open a product while you are signed in and it can appear here.';
