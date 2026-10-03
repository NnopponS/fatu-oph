# Build Handoff

## Durable goal
- goalKey: `fatu-oph.production-bugfix-pass`
- goalId: `b3da8b32-a447-490c-ae59-7f97239cc2d4`
- Resume this goal while stabilization is active.

## Branch contract
Work in `NnopponS/fatu-oph`.
- `main` = FATU Open House 2026
- `2025` = preserved legacy app
- `2026` = transition/reference only

## Preservation point
Antigravity's full pre-stabilization rebuild is preserved in commit:
- `7a34b21 checkpoint: preserve Antigravity rebuild before stabilization`

Do not squash or rewrite that checkpoint while stabilization is in progress.

## Product contracts
Real venue names remain primary:
- โรงละคร -> Azure Dragon
- ตึกคณะ -> White Tiger
- โรงทอ -> Nine-Tailed Fox
- ตึก SC3 -> Red Phoenix

Activities are dynamic Firebase content. New activities must not require code deployment.

Visitors never write authoritative points or operational records directly.

## Current auth/check-in contract
- Participant login: username + password. Email is contact/recovery only.
- Staff login: username + password with `staff_pending` approval gate.
- Admin approval controls operational roles.
- Registration open/closed is server-authoritative and also reflected in the Register UI.
- Activity QR codes are protected by server-generated tokens. If an activity has no initialized QR token, self check-in is rejected until Admin generates one.
- Rotating an activity QR invalidates the previous token.
- Direct venue check-in is idempotent.
- Bearer-token self check-in is allowed only for real participant accounts.
- Per-venue point entitlement is shared by self QR and Staff manual completion.
- Zero-point activities do not consume the venue's point entitlement.
- Username claims are transactionally reserved to prevent concurrent duplicate registration.

## Current core state
Implemented:
- public event/activity/venue/schedule/map/prize/FAQ/pass/check-in pages
- participant username/password registration/login/recovery
- Staff registration/pending/approval/dashboard
- Admin CMS and role-based operations
- secure QR activity completion
- authoritative point ledger, adjustments/reversal, prize redemption
- lucky draw and survey
- audit and staff management
- media UI/API for Vercel Blob
- event-data assistant

Firebase production Rules remain server-only for `/operations`.

## Production runtime
Vercel project:
- https://fatu-oph-2026.vercel.app

Configured runtime includes:
- `VITE_FIREBASE_*`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`
- `BLOB_READ_WRITE_TOKEN`
- Singapore function/blob region configuration

Do not expose or copy secret values into source files.

## Mock demo dataset
Production may contain reversible `mock-*` records for UI review.

Commands:
- `npm run mock:generate`
- `npm run mock:seed`
- `npm run mock:clear`

Mock pass:
- `FATU-MOCK-PASS-2026-20-DEMO-ONLY`

Clear mock content before real event launch unless it is intentionally retained.

## Motion & media contract
Three.js/WebGL was removed on 2026-10-03. It was decorative and added unnecessary mobile bundle/GPU cost.

Current system:
- Anime.js for lightweight DOM motion.
- PinePaper/static SVG/JPG assets from `public/assets` and `public/images`.
- `OpeningExperience.tsx` keeps the roleplay structure using lightweight realm artwork.
- Runtime paths use `/assets/...` or `/images/...`; do not use `/src/assets/...`.
- Google Flow video is optional decorative media only. Every Flow scene must have a static poster/fallback and may not be required for auth, registration, navigation, QR, Staff, or Admin workflows.
- Reduced-motion behavior is mandatory.

Removing Three.js reduced the main production bundle from about 913 KB to about 348 KB minified in the 2026-10-03 build.

## Verification commands
Run before production deploy:
- `npm run check`
- `npm run smoke:api`
- `npm run test:auth-rebuild`
- `npm run test:stabilization`
- `npm audit`
- `npm run preview`
- `npm run test:browser`

2026-10-03 local result: all commands pass; `npm audit` reports 0 vulnerabilities and browser smoke passes 15/15 routes at 412x915.

## Event-day sign-off still requires a human Admin account
Log in with the real Admin account and click through:
- Activities
- Venues
- Prizes
- FAQ
- Announcements
- Operations
- Media
- Audit
- Settings

This is intentionally not automated with a temporary production Admin account.
