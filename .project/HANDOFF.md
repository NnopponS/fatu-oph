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

## Motion & Animation System (Anime.js v4 & Three.js 3D WebGL)

The motion architecture combines **Anime.js v4** (`animejs@4.5.0`) for UI layout & DOM animations with **Three.js** (`three@0.182.0`) for ethereal, mobile-optimized 3D Chinese Mythology WebGL visuals:
- Central Utility: [`src/lib/anime.ts`](file:///D:/Project/fatu-openhouse/src/lib/anime.ts) providing `useAnimeScope`, `MOTION_TOKENS`, `safeAnimate`, and `prefersReducedMotion()`.
- 3D Mythic Realm Spatial Scene: [`src/components/MythicRealmScene3D.tsx`](file:///D:/Project/fatu-openhouse/src/components/MythicRealmScene3D.tsx) procedurally rendering the 4 cardinal sacred realms (North: Theatre/Dragon, West: Faculty/Tiger, South: Weaving/Fox, East: SC3/Phoenix), central Daotai altar, interactive 3D mystery chest, and dynamic camera swooping.
- 3D Celestial Gate Subsystem: [`src/components/CelestialGate3D.tsx`](file:///D:/Project/fatu-openhouse/src/components/CelestialGate3D.tsx) rendering procedural celestial astrolabe rings (浑天仪), Dragon Pearl core, Bagua notches, and swirling Qi vortex stardust particles with real-time touch/pointer drag interaction.
- Roleplay Opening Story Experience: [`src/components/OpeningExperience.tsx`](file:///D:/Project/fatu-openhouse/src/components/OpeningExperience.tsx) features a gamified 4-act prologue where visitors adopt an apprentice martial artist persona, choose their affinity realm with live 3D camera targeting, receive an exciting briefing on event rules with a 3D treasure box, and inscribe their *"ใบเบิกทางจอมยุทธ์"* with a cinnabar seal stamp.
- Home Hero Section: [`src/pages/HomePage.tsx`](file:///D:/Project/fatu-openhouse/src/pages/HomePage.tsx) features interactive 3D Celestial Gate with a toggle button between 3D WebGL and 2D Dragon Art, plus a personalized affinity realm badge in the hero banner.
- Pass Identity Page: [`src/pages/PassPage.tsx`](file:///D:/Project/fatu-openhouse/src/pages/PassPage.tsx) showcases the 3D Dragon Soul Pearl rank card and 3D preview gate.
- About Faculty Page: [`src/pages/AboutPage.tsx`](file:///D:/Project/fatu-openhouse/src/pages/AboutPage.tsx) showcases the 3D Celestial Astrolabe centerpiece.
- Route Page Transition: [`src/components/PageTransition.tsx`](file:///D:/Project/fatu-openhouse/src/components/PageTransition.tsx) integrated in [`AppShell.tsx`](file:///D:/Project/fatu-openhouse/src/components/AppShell.tsx) with automatic scroll reset and card staggering (`out(3)`).
- Upgraded Loading Screen: [`src/components/ThemedLoading.tsx`](file:///D:/Project/fatu-openhouse/src/components/ThemedLoading.tsx) with rotating dragon seal, breathing scale, golden halo ring, and staggered Taoist pearls.
- Mythological Animated Components: [`src/components/AnimatedMythology.tsx`](file:///D:/Project/fatu-openhouse/src/components/AnimatedMythology.tsx) with `<AnimatedSealStamp />` and `<FloatingMythologyAura />`.
- Performance & Mobile Safeguards: 0 external 3D asset downloads, pixel ratio capped at 2, automatic render pause offscreen via `IntersectionObserver`, full memory disposal on unmount, and graceful 2D fallback for reduced motion / non-WebGL environments.
- Full Reference Guide: See [`.project/MOTION_GUIDE.md`](file:///D:/Project/fatu-openhouse/.project/MOTION_GUIDE.md) for full API patterns, token tables, and instructions.

## Verification commands

Run:
- `npm run check` (Vite build + API typecheck + ESLint: 0 errors, 0 warnings)
- `npm run smoke:api`
- `npm run preview` (Local production preview at port 4173)
- `node scripts/test-threejs-animation.mjs` (Automated browser screenshot & console error audit)

When continuing work, follow `.project/MOTION_GUIDE.md` for any new motion features and ensure `npm run check` maintains 0 errors and 0 warnings.


