# IngreCheck privacy draft

Draft for review. A lawyer has not approved this text. Replace every placeholder in square brackets before you publish it. This draft does not claim compliance with any privacy law or store policy.

The same sections are shown in the app under Profile → Privacy draft.

## Who this describes

IngreCheck is operated by [YOUR NAME OR ORGANISATION]. Privacy questions go to [PRIVACY CONTACT EMAIL]. This draft describes the app as built. It is not a promise of legal compliance.

## Product lookups

When you scan or type a barcode, the app sends that barcode to Open Food Facts. When you search by name or brand, it sends that search text to Open Food Facts. The app does not upload a photo of the barcode. Open Food Facts is a separate service with its own policies. Product data from that database is available under the Open Database License, and product images have their own license.

## Accounts

An account is optional. If you create one, Supabase Auth stores your email address and the sign-in method you use, such as email, Google, or Apple. The app can also store a display name you choose. Passwords are handled by Supabase Auth. The app does not keep a copy of your password in its own storage.

## Saved data

If you are signed in, the app can store scan history, favorite products, and ingredient preferences in Supabase. Those rows are tied to your account. They include barcodes and the product name, brand, and image address returned for that barcode. Comparison of two products is not saved to Supabase.

## On this device

The app remembers that you finished the introduction. It can keep a saved copy of a product lookup so a later open can show that copy when the network fails. Sign-in sessions are stored in the device secure storage. The app does not use an analytics or crash-reporting service.

## What we do not collect in the app

The current app does not include an advertising SDK, an analytics SDK, or a crash reporter. It does not ask for your contacts, location, or microphone.

## How long data stays

Scan history, favorites, preferences, and your profile stay until you delete them or delete the account, or until [YOUR NAME OR ORGANISATION] deletes the Supabase project. A saved product copy on the device stays until the app removes older copies or you remove the app. Onboarding completion stays on the device until you remove the app.

## Deleting an account

Profile includes Delete account. The app asks you to confirm, then asks Supabase to delete the signed-in user. Related history, favorites, preferences, and the profile are intended to be removed with that user. If deletion fails, the app says so and points you to the Supabase Authentication screen. Do not treat a failure message as a successful deletion.

## Security limits

No mobile app can promise that data will never be lost, delayed, or accessed by someone who compromises the device, the network, or the database host. The database policies are written so each account should see only its own rows. That separation still needs a test with two real accounts before you describe it as verified.

## Children

IngreCheck is not directed at children. Do not create an account for a child. [ADD ANY AGE LIMIT YOUR STORES OR COUNSEL REQUIRE.]

## Changes

If this notice changes, the published copy should show a new date. Effective date: [EFFECTIVE DATE].

Host this page at a public URL before you submit the stores. Put that URL in the store forms. The in-app screen is not a substitute for the URL.
