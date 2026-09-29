# Status

Date: 2026-09-29

Phase: Firebase Web SDK + Auth/Realtime Database client layer + Vercel media layer are implemented on main; dashboard provisioning remains.

## Repository state

- Repository: NnopponS/fatu-oph
- `2025` preserves the previous Open House 2025 application.
- `main` is the active FATU Open House 2026 development/production branch.
- `2026` may remain temporarily as a transition/reference branch.
- The active 2026 app is a fresh React/Vite baseline, not the old pirate/Lovable UI.
- Production build and lint pass on the new baseline.
- Known npm audit vulnerabilities were resolved during bootstrap.

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
- Firebase Authentication + Realtime Database for application data; no Supabase, SQL Connect, or Firebase Cloud Storage in the 2026 runtime
- fixed media deploys with Vercel; dynamic admin media uses Vercel Blob

## Current external prerequisite

Firebase Web App config is already wired locally for project `fatu-oph-2026`.
Realtime Database is created in `asia-southeast1` and the production database URL is wired into the app.

Firebase Email/Password Authentication is enabled and the Realtime Database rules have been updated in Firebase Console.

Project owner still needs to:

- ensure `/admin/roles/Nb6XJYQMY2fhNsEcwEr5tufjIqr2/role` is set to `admin`
- connect Vercel production to `main`
- create a public Vercel Blob store for dynamic media
- add the Firebase/Vercel environment variables to Vercel

Never commit real credentials. Use `.env.example` only as the variable contract.

## Next work

Complete Phase 0 design/data/security lock, then connect Firebase/Vercel during Phase 1. Real venue images will be supplied separately by the project owner.
