# FATU Open House 2026

Active development branch for FATU Open House 2026.

Theme: ตะลุยแดนมังกร

## Branch model

- main preserves the 2025 application and its history.
- 2026 is the active 2026 product branch.
- New 2026 feature work should branch from 2026 and merge back into 2026.
- Vercel production for the 2026 site should use the 2026 branch until the team explicitly changes the release strategy.

## 2026 direction

The 2026 application is a new product baseline, not a reskin of the 2025 pirate/Lovable application.

Removed from the active application:

- Lovable metadata and lovable-tagger
- pirate UI, fonts, icons, logo and animations
- old placeholder/logo assets
- Supabase runtime and migrations
- committed environment file
- old 2025 hard-coded content

Kept only as references under references/legacy:

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

Activities and point rules will be dynamic Firebase data managed through Admin. Adding or removing an activity must not require a new deployment.

## Local development

Run npm install, then npm run dev.

Copy .env.example to .env.local after the 2026 Firebase project is ready. Never commit real credentials.

## Planning

Read .project/BRIEF.md and .project/IMPLEMENTATION_PLAN.md before broad feature work.
