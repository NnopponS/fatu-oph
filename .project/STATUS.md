# Status

Date: 2026-09-30

Phase: Functional stabilization and production bug-fix pass. Decorative animation/visual polish remains deferred until Admin and visitor runtime behavior is stable.

## Durable goal

- goalKey: `fatu-oph.production-bugfix-pass`
- goalId: `b3da8b32-a447-490c-ae59-7f97239cc2d4`
- Rule: resume this goal; do not create a replacement goal while production stabilization / mock QA is still active.

## Repository

- Repository: NnopponS/fatu-oph
- main: active 2026 development/production branch
- 2025: preserved Open House 2025 archive
- 2026: transition/reference branch only

## Firebase production

- project: fatu-oph-2026
- Realtime Database: asia-southeast1
- Email/Password Auth enabled
- initial Admin role configured
- database.rules.json is the source of truth and latest rules are deployed
- /public is anonymous-read and Admin/Editor-write
- /operations is denied to every browser client; trusted server APIs use Firebase Admin SDK
- public seed remains reproducible from firebase/seed/public.json

## Core system implemented

Visitor:
- Home, Explore, Venue detail, Activity detail
- Schedule derived from dynamic activity times
- Map/directions using real venue names
- participant registration + opaque pass
- pass QR download, recovery credential and restore flow
- activity QR scanner + manual code fallback
- points history and current balance
- prizes catalog
- FAQ, About and event-data assistant

Admin:
- Firebase Auth + role guard
- roles: admin, editor, staff, viewer
- Activities CRUD with venue, schedule, registration/capacity, points and repeat/completion rules
- Venue CRUD
- Prize CRUD
- FAQ + announcements
- Activity QR generation, rotation and PNG download
- participant search/pass scan
- event entry check-in
- staff activity completion
- point adjustment and Admin-only reversal
- prize redemption
- participant CSV export
- staff account creation/role/disable controls
- audit viewer
- media upload/delete UI ready for Vercel Blob

Trusted APIs:
- participant registration/me
- opaque pass hashing; plaintext pass token is never stored server-side
- QR check-in
- atomic duplicate/repeat point protection per participant
- authoritative point ledger and cached total
- staff adjustments and reversal audit
- prize claim limit/stock handling with point debit/refund
- Admin role enforcement
- rate limits for public mutation endpoints
- event-data assistant including personal point lookup when a valid pass is present

## Verification

- npm run check: pass
- API TypeScript check: pass
- ESLint: pass
- npm audit --omit=dev: 0 vulnerabilities
- npm run smoke:api: pass against Firebase Auth + RTDB emulators
- smoke coverage includes public/admin/editor Rules, opaque pass, QR points, duplicate prevention, participant detail, entry check-in idempotency, staff adjustment, staff completion, prize redemption/claim limit, reversal, content audit, staff creation and assistant behavior
- latest production Realtime Database Rules deployed successfully

## Production deployment status

Vercel production is provisioned and publicly reachable:

- project: fatu-oph-2026
- production branch: main
- production alias: https://fatu-oph-2026.vercel.app
- Deployment Protection / Vercel Authentication disabled for the public event site
- Firebase client environment variables configured for Production, Preview and Development
- FIREBASE_DATABASE_URL and FIREBASE_ADMIN_PROJECT_ID configured
- public Vercel Blob store fatu-oph-media created in sin1 and connected to all environments
- Vercel Functions configured in repository for sin1
- public routes /, /explore, /activities, /schedule, /map, /prizes, /faq, /about and /admin/login smoke-tested with HTTP 200
- FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY are configured as server-only Vercel Secrets
- production trusted API smoke passed for registration, pass lookup, QR point grant, duplicate prevention, Admin participant read, event check-in idempotency, staff point adjustment, staff completion idempotency, prize redemption, claim limit, point reversal, Vercel Blob upload/delete and final participant state
- unauthorized Admin and media operations are rejected as expected
- temporary production smoke users/content/participants were removed after verification
- the downloaded Firebase service-account JSON was deleted from the local Downloads folder after the Secrets were installed

## 2026-09-30 production stabilization pass

Issues reproduced from real browser usage and fixed:

- Admin Activities/Content no longer crashes while venue options are still loading; empty select options now render a safe placeholder instead of reading `options[0][0]`
- Admin content screens now expose Firebase load/parse errors instead of silently rendering an empty editor
- Admin content save/delete/QR actions surface rejected API/Firebase operations to the user instead of leaving unhandled promise rejections
- Admin login now maps Firebase Auth failures to actionable Thai messages
- Admin login includes a password-reset flow; the success message does not disclose whether an email exists
- Admin Operations and Staff settings surface async action failures instead of silently failing
- Admin Media sorting tolerates older records without `createdAt`
- Pass clipboard fallback no longer throws on browsers without Clipboard API
- `scripts/api-smoke.ts` now imports the current named Vercel `POST` handlers rather than stale default exports

Verification in this pass:

- `npm run check`: pass
- `npm run smoke:api`: pass after repairing the stale test harness
- `npm audit --omit=dev`: 0 vulnerabilities
- real production browser registration created a participant pass, rendered its QR and showed a 0 starting balance; the temporary participant/pass records were deleted afterward
- invalid Admin credentials now show `อีเมลหรือรหัสผ่านไม่ถูกต้อง` in the UI instead of an unexplained failure
- Admin password-reset UI was exercised successfully
- public visitor routes render in the production browser without runtime blank screens

Authenticated Admin UI route-by-route browser automation is still gated by having a valid Admin login session. Server-side Admin operations and role boundaries are covered by the passing emulator/API smoke suite; after an owner logs in successfully, the remaining Admin pages should still receive one manual click-through before event-day sign-off.

## Mock demo environment active

Production currently contains an intentionally reversible mock dataset for full-system review:

- 20 fictional participants under `mock-p01` ... `mock-p20`
- 12 published mock activities across the four real venue IDs
- 6 published mock prizes with configured stock/point costs
- 5 completed mock prize claims
- point transactions, QR/staff completions, event check-ins, prize runtime and audit rows
- 8 FAQ entries and 3 announcements including a visible DEMO MODE notice
- four venue mock visuals and six prize mock visuals under `public/media/mock`
- production browser verification passed for Home, Explore, Schedule, Rewards and FAQ; all venue/prize images loaded successfully
- demo participant `mock-p20` resolves through the trusted participant API with point history and a completed prize claim

Reproducible controls:
- `npm run mock:generate` regenerates the files
- `npm run mock:seed` safely merges only the mock IDs plus the four canonical venue records
- `npm run mock:clear` removes mock IDs and restores the canonical venue/site baseline
- seed logic merges per collection and must never replace whole `/public` or `/operations`

Demo Pass recovery token (mock-only): `FATU-MOCK-PASS-2026-20-DEMO-ONLY`

Real content should replace this dataset before event launch. Do not mistake mock participants or reward claims for real visitors.

## Deferred phase

Per project-owner direction, decorative animation and visual polish are next phase:
- final reference-driven visual lock
- real venue imagery
- Google Flow scenes
- motion/transitions
- final mobile visual hardening

No decorative work should block core operation.
