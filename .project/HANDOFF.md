# Build Handoff

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

## Remaining prerequisite: Vercel

Vercel CLI is not authenticated yet.

Production needs:
- Vercel project connected to main
- VITE_FIREBASE_* environment variables from .env.example
- FIREBASE_DATABASE_URL
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL
- FIREBASE_ADMIN_PRIVATE_KEY
- public Vercel Blob store / BLOB_READ_WRITE_TOKEN

After Vercel deployment, run one real production smoke pass before event use.

## Next phase

Do not add decorative animation now. Next phase is visual/media polish:
- reference-driven design lock
- real venue photos
- generated art/Google Flow
- motion/reduced-motion
- mobile visual QA

When reusing 2025 code, take only the smallest proven pattern from references/legacy and rewrite it for the 2026 contracts.
