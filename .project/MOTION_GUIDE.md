# FATU Open House 2026 — Motion & Media Guide

## Current standard
The application is mobile-first. Decorative motion must never block registration, navigation, QR check-in, Staff operations, or Admin CMS.

Runtime engines:
- Anime.js v4 for lightweight DOM animation.
- Framer Motion only where already used for focused UI transitions.
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
`src/components/OpeningExperience.tsx` keeps the 4-act roleplay/story structure, but the realm stage uses lightweight static artwork.

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
