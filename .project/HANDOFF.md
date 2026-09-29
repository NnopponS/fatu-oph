# Build Handoff

## Repository and branch

Work in repository `NnopponS/fatu-oph`.

- `main`: active FATU Open House 2026 development and production branch
- `2025`: preserved Open House 2025 archive
- `2026`: temporary transition/reference branch only

Implement new 2026 work from `main` and merge back into `main`.

The active 2026 baseline has Lovable, pirate UI, Supabase and old active assets removed. Selected old patterns are isolated under `references/legacy`.

## Read first

1. .project/BRIEF.md
2. .project/ARCHITECTURE.md
3. .project/UI_SYSTEM.md
4. .project/CONTENT_AND_ADMIN.md
5. .project/AI_AND_MEDIA.md
6. .project/REUSE_MANIFEST.md
7. .project/IMPLEMENTATION_PLAN.md
8. references/ui
9. references/legacy only when a specific proven workflow is useful

## Real location naming contract

Public location names:

- โรงละคร
- ตึกคณะ
- โรงทอ
- ตึก SC3

Visual identities:

- โรงละคร -> Azure Dragon
- ตึกคณะ -> White Tiger
- โรงทอ -> Nine-Tailed Fox
- ตึก SC3 -> Red Phoenix

Visual identity is presentation metadata only. Never replace a physical venue name with a fantasy place name.

## Dynamic activity and points contract

Activities are Firebase runtime data managed by Admin.

Admin must be able to create/edit/publish/unpublish/archive activities, assign a real venue, manage content/media/schedule/capacity/registration, enable or disable points, set point values and completion/repeat rules, and review/correct auditable point transactions.

Do not create one-off application code for ordinary new activities.

Visitors must never directly write authoritative score transactions.

## Technical constraints

- mobile browser first
- Vercel deployment from `main`
- Firebase Authentication + Realtime Database for application data
- Vercel `public/media` for fixed authored assets
- Vercel Blob for dynamic admin-managed media
- trusted server-side validation for score-sensitive operations
- no Supabase in active 2026 runtime
- no Lovable runtime/tagger/branding
- no pirate visual language
- no emoji in final UI
- no client-exposed AI or privileged server credentials
- Google Flow is pre-rendered media with poster/static fallback
- animation never blocks navigation or core information

## Current prerequisite

Firebase Web App configuration is already wired locally. Before runtime integration is complete, set `VITE_FIREBASE_DATABASE_URL`, enable Email/Password Auth, connect Vercel production to `main`, and create a public Vercel Blob store. Use `.env.example` as the environment contract and never commit runtime secrets.

## Next implementation work

Complete Phase 0 before broad feature implementation:

- inspect/tag reference screenshots
- lock mobile wireframes and design tokens
- create venue visual-identity art direction
- define real venue media slots
- finalize Firebase schema/security draft
- finalize dynamic activity schema
- finalize point ledger and duplicate/repeat rules
- define trusted mutation path
- produce exact Phase 1 checklist

When reusing old code, copy the smallest useful logic pattern from `references/legacy` and rewrite it to the 2026 contracts rather than restoring legacy files into `src`.
