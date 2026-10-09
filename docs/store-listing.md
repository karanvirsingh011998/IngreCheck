# Store listing drafts

These drafts describe the app that is in this repository. They are not store approval. Do not submit them until a lawyer has reviewed the privacy and terms drafts and you have hosted those pages.

Replace [SUPPORT EMAIL], [PRIVACY URL], and [MARKETING URL] before submission.

## Name

IngreCheck

## Short description

Scan a packaged food barcode and read the ingredient, nutrition, allergen, and processing details that are available.

## Full description

IngreCheck helps you look up a packaged food from its barcode.

Scan with your camera or type the barcode. When Open Food Facts has a record, you can review:

- Ingredients, with short notes for names the app recognizes
- Nutrition values, with the unit and serving basis the record provides
- Allergens and traces when the record lists them
- A NOVA processing group when the record includes one
- A side-by-side comparison of two products

An account is optional. With an account you can save scan history, favorites, and ingredient names you want to avoid or monitor.

IngreCheck does not detect every allergen, guarantee that a food is safe, or give a health score. Product records can be incomplete or different from the package in your hand. Check the label, especially if you have a food allergy.

## Keywords

food barcode, ingredients, nutrition label, allergens, packaged food, Open Food Facts, NOVA

Use the keyword field only where the store still has one. Apple’s keyword field has a character limit. Do not repeat the app name in every keyword.

## Category

Food & Drink, if that category is available. Otherwise Health & Fitness is a weaker fit because the app does not provide medical advice. Confirm the category list in the store console on the day you submit. Category names change.

## Feature list for the console

- Barcode scan and manual barcode entry
- Ingredient, nutrition, allergen, and NOVA details when the database has them
- Compare two products
- Optional account, history, favorites, and ingredient preferences
- No purchase required

## Screenshot plan

Capture these on a phone, in portrait, after the introduction:

1. Home, with the tagline visible.
2. Scanner frame, or the typed-barcode sheet if the camera cannot be captured.
3. A real product page that shows ingredients and a missing-data state if you have one.
4. Comparison of two real products.
5. Profile, signed out, showing that an account is optional.

Suggested captions:

1. Scan ingredients. Know instantly.
2. Read the barcode on your phone, or type it.
3. See the details the database actually has.
4. Compare two products without a winner or a health score.
5. Scan first. An account is optional.

Check the current screenshot sizes in App Store Connect and Play Console before you export. Do not rely on an old size chart in this file.

## Release notes template

First release. Scan a packaged food barcode to view available ingredients, nutrition, allergens, and processing details. Compare two products. Product information comes from Open Food Facts and can be incomplete.

## Review notes

Tell the reviewer:

- Camera is used only to read a barcode. Photos are not uploaded.
- The app works without signing in.
- A useful barcode that currently resolves is 3017620422003.
- There is no in-app purchase.
- Test account, only if you want them to open history: [TEST EMAIL] / [TEST PASSWORD], created by you in Supabase.

## Manual store steps

You must do these yourself:

- Create a Google Play Console account and pay its fee.
- Create an Apple Developer account and pay its fee.
- Create the app records.
- Host the privacy draft at [PRIVACY URL] and add that URL in both consoles.
- Complete Data safety (Play) and App Privacy (Apple) from the privacy draft, including the barcode lookup and optional account data.
- Complete the content rating questionnaires.
- Set a support contact: [SUPPORT EMAIL].
- Create signing keys in the consoles or with EAS. Do not commit keystores or certificates.
- Upload screenshots and the listing text.
- Submit for review.

This repository has not created those accounts, uploaded a build, or received approval.
