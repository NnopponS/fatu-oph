# Build Handoff

## Durable goal

- goalKey: `fatu-oph.production-bugfix-pass`
- goalId: `b3da8b32-a447-490c-ae59-7f97239cc2d4`
- Resume this goal. Do not create a replacement goal while stabilization/mock QA is active.

## Branch contract

Work in NnopponS/fatu-oph.
- main = FATU Open House 2026
- 2025 = preserved legacy app
- 2026 = transition/reference only

## Product contracts

Real venue names remain primary:
- โรงละคร -> Azure Dragon
- ตึกคณะ -> White Tiger
- โรงทอ -> Nine-Tailed Fox
- ตึก SC3 -> Red Phoenix

Activities are dynamic Firebase content. Ordinary new activities must never require a code deployment.

Visitors never write authoritative points or operational records directly.

## Current core state

The functional core is implemented:
- public event/activity/venue/schedule/map/prize/FAQ/pass/check-in pages
- participant opaque pass registration and recovery
- Admin CMS and role-based operations
- QR activity completion
- authoritative trusted-server points, adjustment/reversal and redemption
- audit and staff management
- media UI/API ready for Vercel Blob
- event-data assistant

Firebase production Rules are deployed and /operations is server-only.

## Verification commands

Run:
- npm run check
- npm run smoke:api
- npm audit --omit=dev

The emulator smoke test intentionally pins firebase-tools@14.17.0 because the local machine has Java 17; current firebase-tools 15 requires Java 21. Production Firebase Rules deploys can continue using firebase-tools 15.

## Production runtime complete

Vercel production is linked and deployed from main at https://fatu-oph-2026.vercel.app.

Production runtime now includes:
- VITE_FIREBASE_* environment variables
- FIREBASE_DATABASE_URL
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY stored as server-only Vercel Secrets
- public Vercel Blob store and BLOB_READ_WRITE_TOKEN
- public deployment protection disabled
- Singapore Blob region and repository function region config

Production APIs passed registration/pass, QR points, duplicate prevention, Admin participant operations, event check-in, point adjustment/reversal, prize redemption/claim limit, and Blob upload/delete.

A later real-browser stabilization pass fixed the Admin content empty-options crash, added actionable Auth errors/password reset, hardened async Admin error handling, repaired the stale API smoke harness, and exercised the visitor registration/pass flow in production. Temporary production smoke data was cleaned up afterward.

Before event-day sign-off, log in with the real Admin account and click through Activities, Venues, Prizes, FAQ, Announcements, Operations, Media, Audit and Settings once. The automated Admin API/role suite passes, but temporary Auth-user creation for a full browser Admin sweep is intentionally not used.

## Mock demo dataset

Production currently has a reversible mock dataset so the entire UI can be reviewed with realistic volume:
- 20 fictional participants
- 12 activities
- 6 published mock prizes and 5 completed mock claims
- point history, check-ins, completions, prize runtime and audit rows
- 8 FAQ items and 3 announcements
- 4 venue SVG mock visuals and 6 prize SVG mock visuals

Commands:
- `npm run mock:generate`
- `npm run mock:seed`
- `npm run mock:clear`

The seed script merges per collection and uses `mock-*` IDs so non-mock participants/content are preserved. The four canonical venue records are temporarily enriched with mock descriptions/media and are restored to the baseline by `mock:clear`.

Mock pass for visitor-side history review: `FATU-MOCK-PASS-2026-20-DEMO-ONLY`.

The downloaded Firebase Admin JSON has been deleted from the local Downloads folder. If the Vercel Secrets ever need to be replaced, generate a new service-account key rather than reusing the deleted file.

## Next phase

Do not add decorative animation now. Next phase is visual/media polish:
- reference-driven design lock
- real venue photos
- generated art/Google Flow
- motion/reduced-motion
- mobile visual QA

When reusing 2025 code, take only the smallest proven pattern from references/legacy and rewrite it for the 2026 contracts.
