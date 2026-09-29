# Status

Date: 2026-09-29

Phase: Firebase infrastructure is provisioned and verified. Vercel provisioning is the next external setup step.

## Repository state

- Repository: NnopponS/fatu-oph
- `2025` preserves the previous Open House 2025 application.
- `main` is the active FATU Open House 2026 development/production branch.
- `2026` remains only as a temporary transition/reference branch.
- The active 2026 app is a fresh React/Vite baseline, not the old pirate/Lovable UI.
- Production build and lint pass.
- Production dependency audit has no known vulnerabilities.

## Firebase status

Project:

- Firebase project: `fatu-oph-2026`
- project state verified ACTIVE through Firebase CLI
- Realtime Database instance: `fatu-oph-2026-default-rtdb`
- region: `asia-southeast1`
- web SDK is wired to the production database URL

Authentication:

- Email/Password authentication is enabled
- the initial Admin authentication account exists, is enabled, and uses the password provider
- the corresponding RTDB role is stored in the required object form: `{ "role": "admin" }`
- no password or Auth export file is retained in the repository

Realtime Database:

- `database.rules.json` is the repository source of truth
- rules were syntax-checked and deployed successfully through Firebase CLI
- anonymous root reads are denied
- anonymous `/admin` reads are denied
- anonymous writes are denied
- `/public` reads are allowed
- score-sensitive `pointTransactions`, `pointTotals`, and `audit` reject client writes and are reserved for future trusted server operations
- staff/admin client writes are limited to event-operation paths such as participants, registrations, passes, check-ins, activity completions, and prize claims

Verified permission probe:

- public read -> HTTP 200
- root read -> HTTP 401
- admin read -> HTTP 401
- anonymous public write -> HTTP 401
- denied write probe left no data behind

Seed data:

- reproducible public bootstrap lives at `firebase/seed/public.json`
- site name/year/theme are seeded
- four confirmed real venues are seeded and published
- known prize names are seeded as unpublished placeholders; stock, point requirements, and redemption mechanics remain unset until confirmed
- activities remain dynamic and are not hard-coded or pre-seeded

## Active architecture

- Firebase Authentication for Admin/Staff identity
- Firebase Realtime Database for application/event data
- no Firebase Cloud Storage
- no SQL Connect
- no Supabase
- fixed media will deploy with Vercel from `public/media`
- dynamic Admin-managed media will use Vercel Blob
- Realtime Database stores media URL/metadata only, never binary/Base64 files

## Removed from active 2026 code

- Lovable metadata and lovable-tagger
- pirate components, fonts, styling, logos and animations
- old placeholder/logo assets
- Supabase runtime, functions and migrations
- tracked legacy .env
- old 2025 hard-coded activity/content implementation
- old Tailwind pirate design-system configuration

## Preserved only as legacy references

Selected 2025 implementation patterns live under `references/legacy` for later review/rewrite:

- QR scanner/check-in
- location/activity admin CRUD
- participant admin patterns
- auth context
- check-in signing/crypto
- Firebase adapter/data service
- Excel export
- selected route/content patterns

Legacy reference files are excluded from active lint/build scope and must not be copied blindly into production.

## Confirmed product decisions

- Theme: ตะลุยแดนมังกร (จีน)
- Visitor-facing real locations: โรงละคร, ตึกคณะ, โรงทอ, ตึก SC3
- Azure Dragon, White Tiger, Nine-Tailed Fox and Red Phoenix are visual identities only
- activities are dynamic Admin-managed data
- Admin configures point enablement, value and completion/repeat rules
- adding/removing an activity must not require developer work or deployment
- point history is auditable and visitors cannot directly grant themselves authoritative points

## Next external setup

Firebase is complete enough to proceed.

Next:

- connect Vercel production to `main`
- configure Firebase environment variables in Vercel
- create a public Vercel Blob store for dynamic media
- let Vercel provide `BLOB_READ_WRITE_TOKEN`
- redeploy and perform an end-to-end production smoke test

After Vercel is ready, continue Phase 0/1 implementation for Admin, dynamic activities, points/check-in, prizes, media and visitor pages.
