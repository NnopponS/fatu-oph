# FATU Open House 2026

Main development baseline for FATU Open House 2026.

Theme: ตะลุยแดนมังกร

## Branch model

- `main` is the active FATU Open House 2026 development and production branch.
- `2025` preserves the previous Open House 2025 application as an archive/snapshot.
- The existing `2026` branch may remain temporarily as a transition/reference branch, but new work should branch from `main` and merge back into `main`.
- Vercel production should track `main`.

## 2026 direction

The 2026 application is a new product baseline, not a reskin of the 2025 pirate/Lovable application.

Removed from the active application:

- Lovable metadata and lovable-tagger
- pirate UI, fonts, icons, logo and animations
- old placeholder/logo assets
- Supabase runtime and migrations
- committed environment file
- old 2025 hard-coded content

Kept only as references under `references/legacy`:

- selected QR/check-in patterns
- selected Firebase data patterns
- selected admin CRUD patterns
- auth/check-in signing concepts
- Excel export logic
- selected route/component patterns

These references must be reviewed and rewritten for the 2026 Firebase-only architecture rather than copied blindly.

## Current product decisions

Visitor-facing locations use their real names:

- โรงละคร
- ตึกคณะ
- โรงทอ
- ตึก SC3

Azure Dragon, White Tiger, Nine-Tailed Fox and Red Phoenix are visual identities only.

Activities and point rules are dynamic Realtime Database data managed through Admin. Adding or removing an activity must not require a new deployment.

Backend split:

- Firebase Authentication: Admin/Staff sign-in
- Firebase Realtime Database: venues, activities, participants, check-ins, points, prizes, audit and media metadata
- Vercel `public/media`: fixed authored images/video
- Vercel Blob: dynamic Admin-uploaded media
- No Firebase Cloud Storage, SQL Connect, or Supabase in the 2026 runtime

## Local development

Run `npm install`, then `npm run dev`.

Copy `.env.example` to `.env.local` after the 2026 Firebase project is ready. Never commit real credentials.

## Planning

Read `.project/BRIEF.md` and `.project/IMPLEMENTATION_PLAN.md` before broad feature work.
