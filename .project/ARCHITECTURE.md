# Architecture

## Product goal

Build a polished FATU Open House mobile-first web app for the theme "ตะลุยแดนมังกร (จีน)".

The experience uses Chinese mythical creatures as visual identities while keeping every physical place clearly identified by its real name:

- โรงละคร — Azure Dragon visual identity
- ตึกคณะ — White Tiger visual identity
- โรงทอ — Nine-Tailed Fox visual identity
- ตึก SC3 — Red Phoenix visual identity

Visitors should never need to decode a fantasy place name to know where to walk. Real venue names, recognizable photos/video, landmarks, maps, and directions take precedence over decorative theme language.

Visitors must be able to discover locations and activities, collect points from configured activities, view rewards, navigate to places, access registration/pass flows when enabled, and ask the AI assistant questions.

## System boundary

### Client

Recommended implementation stack:

- React + TypeScript + Vite
- React Router
- project-owned CSS variables/components (native CSS first; no Tailwind dependency unless a concrete need appears)
- accessible component primitives
- Framer Motion for lightweight interface transitions
- project-owned SVG/icon assets or Lucide icons
- native HTML/CSS first
- TanStack Query only where caching materially helps

Google Flow video outputs are normal authored media files, not runtime application logic.

### Hosting

Vercel hosts:

- static SPA assets
- serverless API endpoints needed for trusted operations and AI assistant
- environment secrets
- preview deployments

Core visitor pages must remain usable if AI or decorative animation is unavailable.

### Backend split

Firebase Authentication and Realtime Database are the application data/auth backend. Vercel hosts the web/API runtime and media delivery. Binary media is not stored in Realtime Database.

Use:

- Firebase Authentication: staff/admin identity
- Firebase Realtime Database: venues, activities, schedules, point configuration, participant operations, prize configuration, settings, and approved assistant knowledge
- Vercel deployment assets (`public/media`): fixed venue media, generated artwork, Flow exports, and poster fallbacks
- Vercel Blob: dynamic admin-managed images/video; Firebase stores only URL/metadata
- Firebase Security Rules: public read only for published content; authenticated writes only for authorized roles

For point-granting, prize redemption, or any operation where client-controlled writes could alter score, use a trusted server-side path such as Vercel server functions with Firebase Admin SDK or another Firebase trusted server mechanism. Do not allow visitors to author authoritative point transactions directly.

Do not use Supabase.

## Runtime architecture

Visitor browser
-> Vercel static app
-> Firebase Realtime Database for published content
-> Vercel static asset or Vercel Blob URLs for images/video

Visitor completion/check-in action
-> trusted server endpoint or authorized staff action
-> validate activity rule and duplicate/repeat constraints
-> append point transaction
-> update/read authoritative balance

Visitor browser
-> Vercel /api/assistant
-> server-side AI provider
-> approved published event context from Firebase
-> answer returned to visitor

Admin browser
-> Firebase Auth
-> Admin workspace
-> Firebase Realtime Database / trusted operational endpoints
-> Vercel static assets / Vercel Blob

## Content domains

Primary content domains:

- site
- venues
- visualIdentities
- activities
- schedule
- prizes
- announcements
- FAQ
- assistantKnowledge
- media
- pointRules
- operations

## Route architecture

Public routes:

- / : campaign landing and primary CTA
- /explore : locations and current activities
- /venue/:slug : real venue detail and activities at that venue
- /activity/:slug : activity detail
- /schedule : published schedule
- /map : real-location map and directions
- /prizes : prizes, points balance, and redemption information when published
- /pass : registration/pass or QR entry surface when enabled
- /faq : important visitor information
- /assistant : full-screen AI assistant
- /about : faculty/open-house information

Admin routes:

- /admin/login
- /admin
- /admin/activities
- /admin/venues
- /admin/schedule
- /admin/points
- /admin/prizes
- /admin/participants
- /admin/media
- /admin/content
- /admin/assistant
- /admin/settings
- /admin/audit

Do not put every admin feature into one giant page.

## Dynamic activity contract

The shared application supports arbitrary admin-created activities.

Adding a new activity must not require:

- a new route implementation
- a new React component
- a code deployment
- a new database schema

Activity rendering, schedule display, completion behavior, and point awarding should be driven by the activity record plus reusable UI/logic.

## Mobile performance contract

Design around 360-430 px viewport widths first.

Targets:

- core text, real venue name, and CTA render before large decorative media
- hero art/video has mobile-specific composition
- no mandatory WebGL/3D for core flows
- Flow video is lazy-loaded and always has a poster/still fallback
- real venue image/landmark remains available even when decorative video fails
- motion is enhancement; respect prefers-reduced-motion
- tap targets at least 44 px
- avoid horizontal scrolling and tiny text

## Reliability and integrity contract

- Event details, activities, schedules, venue directions, point rules, prizes, and FAQ content come from Firebase and remain editable.
- Decorative media failure must not block text or navigation.
- AI failure must fall back to FAQ/search/help links.
- No API secret may be embedded in client environment variables.
- Never store admin passwords manually in Realtime Database; use Firebase Auth.
- Visitors cannot directly mutate authoritative point balances.
- Point operations and prize claims must be auditable.
- A new activity can be launched entirely through Admin once infrastructure is deployed.

## Environment prerequisite

Implementation starts after Vercel and Firebase project access/configuration are available. Environment-specific IDs and keys go into deployment/local environment configuration, not documentation or committed source.
