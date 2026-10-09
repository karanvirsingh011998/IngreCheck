# Launch checklist

Evidence is from the code in this repository and from tests run in this workspace. A phone was not used for the checks below. Row Level Security has not been tested with two accounts.

## Audit

| Area | Status | Evidence |
| --- | --- | --- |
| Home, scanner, product lookup | Complete | Screens and Open Food Facts client exist. Lookup tests cover not found, bad JSON, network, timeout, and rate limit. |
| Ingredients, nutrition, allergens, NOVA | Complete | Product screen sections exist. Missing nutrition is labeled Not available. Salt and sodium stay separate. NOVA is shown only for groups 1–4. |
| Comparison | Complete | Compare screen, saved-product picker, and comparison tests exist. No health winner. |
| Optional accounts | Complete in code | Email, Google, and Apple flows exist. Google and Apple still need dashboard credentials. |
| History, favorites, preferences | Partially complete | App code and SQL file exist. The SQL has to be applied in your Supabase project. Two-account access is not verified. |
| Premium | Partially complete | Information screen only. No store billing, by design. |
| Onboarding | Complete in code | First launch shows three steps and stores completion on the device. |
| Camera permission states | Complete in code | Ask, deny, Settings, camera failure, retry, and manual entry exist. Confirm on a phone. |
| Privacy and terms | Partially complete | Drafts are in the app and in `docs/`. Placeholders remain. A lawyer has not reviewed them. A public URL is not hosted. |
| Analytics and crash reporting | Missing on purpose | `src/features/telemetry.ts` is a no-op. No SDK is installed. |
| Icons | Complete | `assets/icon.png` and Android adaptive icons exist. |
| Splash screen | Partially complete | The splash plugin points at `assets/splash-icon.png`. A new native build is required before the splash changes on a phone. |
| EAS profiles | Partially complete | `eas.json` has development, preview, and production. No production build was made in this pass. |
| Store listing | Partially complete | Draft text is in `docs/store-listing.md`. Accounts, screenshots, and submission are manual. |
| RLS | Needs manual verification | Policies are in the SQL file. Unit tests do not prove them. |

## Launch blockers you still do

1. Run `supabase/migrations/20261009140000_phase2_user_data.sql` in the Supabase SQL Editor if you have not.
2. If `.env` ever contained a real service-role key under `EXPO_PUBLIC_SERVICE_ROLE`, rotate that key in Supabase. The app does not read it. The name was public, so treat a real value as exposed.
3. Confirm the Supabase URL in `.env` is `https://YOUR_PROJECT.supabase.co` with no `/rest/v1` suffix. The app now strips a trailing `/rest/v1` if it is still there.
4. Replace the placeholders in `docs/privacy-policy.md` and `docs/terms-of-use.md`, have them reviewed, and host the privacy page.
5. Test two accounts against history, favorites, and preferences.
6. Install a new development or preview build before you judge the splash screen or the camera permission text, because those are native.
7. Create the store accounts and complete Data safety, App Privacy, and the content questionnaires yourself.

## Optional

- Install `expo-dev-client` before using the EAS development profile: `npx expo install expo-dev-client`.
- Add crash reporting later behind `recordEvent` only if you also update the privacy draft.
- Capture the screenshots listed in `docs/store-listing.md`.

## Builds

Development build: a binary that loads this project from your computer. The `development` profile expects a dev client. Install `expo-dev-client` first.

Internal testing build: `eas build --profile preview`. The Android preview profile makes an APK you can sideload.

Production build: `eas build --profile production`. Android uses an App Bundle for Play. This command was not run here. Signing happens in EAS or the store, and those credentials must stay out of git.

Local run of the current JavaScript, after Node 22 is selected:

```bash
npx expo start --dev-client
```

Checks:

```bash
npx tsc --noEmit
npm test
```
