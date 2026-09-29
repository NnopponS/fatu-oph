# Status

Date: 2026-09-29

Phase: Core functional system implemented and verified locally. Decorative animation/visual polish is intentionally deferred. Production Vercel provisioning is the remaining external runtime step.

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

## Remaining external runtime setup

Vercel CLI is currently logged out. Before production end-to-end use:

- authenticate/connect Vercel
- production branch = main
- configure client Firebase environment variables
- configure FIREBASE_DATABASE_URL
- configure Firebase Admin service-account environment variables
- create/connect public Vercel Blob and BLOB_READ_WRITE_TOKEN
- deploy and run production smoke tests for Auth, server APIs, camera/QR and Blob upload

## Deferred phase

Per project-owner direction, decorative animation and visual polish are next phase:
- final reference-driven visual lock
- real venue imagery
- Google Flow scenes
- motion/transitions
- final mobile visual hardening

No decorative work should block core operation.
