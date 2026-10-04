# FATU Open House 2026 — Motion & Media Guide

## Cinematic formations and organizer location corrections (2026-10-04)

- `CelestialArray.tsx` provides the shared rotating gold/jade formation used by the gate, guardian summons, scrolls, route transitions and treasure ritual. `cinematic.css` handles atmospheric cloud layers, hinged doors, light columns, seal ripples and click sparks with bounded SVG/CSS effects.
- The opening gate opens in 1.35 seconds; skipping and Escape remain available. Small-height phones can scroll the destinations while the skip button remains visible. Guardian portraits are still shown only after choosing/summoning; real building photos remain the primary preview.
- All new effects respect reduced motion and are decorative with no pointer interception. No reward odds, points or stock are changed by animations.
- `realms.ts` holds the organizer's exact four Google Maps links and names: โรงละคอน, ตึกคณะศิลปกรรมศาสตร์, โรงทอ, ตึก SC3. `useVenues` normalizes older CMS records for every public view. `realmForPlace` recognizes legacy names in persisted check-in results; the correct guardian is preserved after renaming.
- Local dev and preview API routing is documented in `API_PREVIEW.md`; `test:api-routing` uses an isolated upstream.

## Current standard
The application is mobile-first. Decorative motion must never block registration, navigation, QR check-in, Staff operations, or Admin CMS.

Runtime engines:
- Anime.js v4 for lightweight DOM animation.
- Framer Motion for the opening, check-in feedback and reward ceremony, with a shared reduced-motion configuration.
- No Three.js/WebGL runtime dependency.

Three.js was removed on 2026-10-03 because the 3D scenes were decorative and increased the main bundle/GPU cost without improving the core event flow.

## Core utility
Use `src/lib/anime.ts`:
- `useAnimeScope`
- `safeAnimate`
- `MOTION_TOKENS`
- `prefersReducedMotion()`

Always scope DOM animation to the component lifecycle and respect `prefers-reduced-motion`.

## Approved motion patterns
- short page/card entrances
- seal stamp feedback
- loading seal rotation
- subtle floating mythology artwork
- QR success feedback
- reward reveal feedback

Avoid:
- continuous heavy canvas/WebGL rendering
- autoplay video with sound
- motion that delays navigation or input
- decorative effects that trigger network requests before core content is usable

## Opening experience
`src/components/OpeningExperience.tsx` uses three short interactive scenes: open the dragon gate, select a first destination, and receive the journey instructions. `WuxiaScene.tsx` supplies reusable lanterns, the gate, particles, seal feedback and an animated CSS chest.

The experience must:
- remain skippable
- be session-gated
- respect reduced motion
- never be required to reach Register/Login
- never mutate points or operational state

## Runtime asset contract
Canonical runtime assets:
- `public/assets/**` -> use as `/assets/...`
- `public/images/**` -> use as `/images/...`

Do not add runtime references to `/src/assets/...`.

## Google Flow plan
Google Flow may replace selected decorative stills with short authored video loops, especially:
- visitor home hero
- optional opening story backdrop
- optional realm ambience

Requirements for every Flow video:
1. Provide a static poster fallback.
2. Keep the core layout functional when video fails to load.
3. Prefer muted inline playback.
4. Do not require video for any button, form, QR, map, Staff, or Admin task.
5. Keep file size/mobile data usage controlled.
6. Disable or simplify motion for reduced-motion users.

Recommended delivery:
- export MP4/WebM from Flow
- upload via the existing media pipeline/Vercel Blob if Admin-managed
- store only metadata/URL in Firebase
- use a poster image from `public/images` or approved media

## Verification
Before adding or changing motion/media:
- `npm run check`
- inspect mobile layout at ~390–430 px width
- verify reduced-motion fallback
- verify no console errors
- confirm the page still works with decorative media blocked

The shortest acceptable implementation is preferred: static art first, Flow video only when it materially improves the experience.

## 2026-10-04 experience improvements

- `AppShell` owns the visitor header and bottom navigation. Scan, survey and lucky-draw pages must not mount another shell or another bottom navigation. Content and scroll margins reserve the navigation height plus the device safe area.
- The QR video stays mounted while requesting permission. Request generations cancel obsolete streams, including responses arriving after navigation or camera switching. Permission failure leaves image upload and manual entry available.
- Successful check-in shows the real server result, a seal stamp and the actual point total. Duplicate check-ins do not display additional awarded points.
- Schedule includes published activities with missing times, clearly labelled as unspecified. Search, venue/date/period filters and locally saved activities support planning. ISO timestamps and unzoned CMS datetimes use Asia/Bangkok; live labels require a dated start and a defined end.
- `JourneyBoard` links to real venue names, reflects the participant's recorded visits and recommends an unvisited destination. Picking a guardian changes the suggested starting point only; it does not alter points or reward odds.
- Staff and administrators share `/admin/login` and `/admin`. Existing `/staff` URLs redirect to the corresponding portal pages. Admin and Staff may use field operations and participant management; Editor may edit content; Viewer may see the overview; pending Staff must await approval. The layout blocks direct navigation to unauthorized modules, and the backend continues to enforce roles.
- Staff manual completion resolves a participant username or UID through a protected minimal lookup. Voucher redemption displays the server voucher's prize and recipient.
- The reward ceremony performs one server draw, then reveals its persisted voucher. It supports optional sound, reduced motion and skipping the decorative animation. A lost draw response triggers a status lookup; it never automatically issues a second draw. The voucher survives reloads.
- Chinese seal SVGs use cropped square view boxes. Their movement is controlled by the application so reduced-motion preferences also apply.

Verification commands:

```text
npm run check
npm run test:experience       # localhost Vite dev server on port 5173
npm run test:browser          # production build preview on port 4173
npm run test:stabilization    # isolated Firebase Auth / Database emulators
```

`CAPTURE_EXPERIENCE=1` saves local screenshots under `previews/rework/`. Experience fixtures are restricted to localhost and never mutate the event database. Physical camera permissions and video behaviour should also be checked on the phones used at the event.

On this Windows installation, SWC requires its native cache outside the broad AppData permissions. In the PowerShell session running Vite/build commands, use `$env:SWC_NATIVE_BINDING_CACHE = Join-Path $env:USERPROFILE '.codex/swc-native-cache'` before running npm. This is a local runtime setting and requires no changes to directory permissions or Vercel configuration.

## Photo-first realms and scroll effects (2026-10-04)

- `src/lib/realms.ts` holds the canonical realm/place mapping.
- `RealmPlaces.tsx` uses real building WebP photographs as the primary preview on opening, home, map, passport and venue pages. Photograph sources are recorded in `public/images/venues/credits.json`.
- The organizer supplied the Playhouse and weaving building images and confirmed the weaving image mapping.
- Guardians are summoned explicitly from photo cards. The small guardian portrait is part of the button; the larger manifestation appears after activation.
- `/checkin` redirects to `/scan`, so all public QR entry points share the same camera lifecycle, authentication, manual input and check-in result.
- `DragonScroll.tsx` supplies the navigation unfurl and confirmed check-in power sequence. Duplicate check-ins do not play an award sequence.
- The treasure ceremony progresses through charging, summoning and opening before revealing the persisted server reward. Animation can be skipped; reduced-motion removes the ceremonial delay.
- `PrizeArtwork.tsx` prioritizes published prize media and labels fallback artwork as illustrations. Catalog stock, point prices and claim limits come from published content. This UI change does not alter production prize stock or draw odds.
- `scripts/experience-regression.mjs` verifies photo/guardian interactions, QR feedback, keyboard modal exits, canonical scanner navigation, published prize filtering, role boundaries and mobile layout at 360/412 pixels. Fixture writes are limited to a local development browser.
