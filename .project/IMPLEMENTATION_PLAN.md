# Main Implementation Plan

This document defines the build sequence.

Read .project/BRIEF.md first.

## Phase 0: requirement and design lock

Goal: convert the supplied references and confirmed brief into a precise build contract.

Confirmed:

- visitor-facing locations use real names only: โรงละคร, ตึกคณะ, โรงทอ, ตึก SC3
- Chinese mythical creatures are visual identities, not alternate place names
- activities are dynamic and admin-managed
- admin controls point awards and completion/repeat rules
- new activities must not require development or deployment
- Vercel + Firebase only
- Google Flow is used for selected decorative/immersive scenes
- current external prerequisite is owner setup of Vercel and Firebase

Tasks:

- review/tag the 10 reference images
- produce mobile wireframes for Home, Explore, Venue, Activity, Map, Prizes/Points, Assistant, Admin
- finalize design tokens/typefaces
- define visual prompt sheet for four venue identities
- define five planned Flow shots: home + four venue scenes
- define where real venue images/video/landmarks appear alongside generated media
- finalize Firebase schema and Security Rules draft
- finalize dynamic activity schema
- finalize point transaction/duplicate prevention/repeat-rule contract
- define admin roles and event-day point/reward workflow

Exit:

- page inventory approved
- mobile wireframes approved
- real-location naming contract reflected everywhere
- Firebase schema/security draft approved
- dynamic activity/points contract approved
- no page or feature depends on hard-coded activity records

## Phase 1: foundation

Build:

- Vite/React/TypeScript
- mobile app shell
- routing
- design tokens
- Firebase SDK
- Firebase Auth for staff/admin
- Realtime Database content adapter
- Firebase Storage media adapter
- Vercel project/config
- environment configuration
- reusable image/video media component with poster fallback
- typed generic venue/activity data layer

External prerequisite:

- Vercel project/access ready
- Firebase project ready
- Firebase Web App config ready
- Auth, Realtime Database, and Storage enabled

Exit:

- deployable shell
- content loads from Firebase
- admin login works
- preview and production environment configuration are separated
- media component handles still/poster/video safely

## Phase 2: core visitor experience

Build:

- Home
- Explore
- real Venue pages
- generic Activity detail page
- Schedule
- Map with real venue names/directions
- Prizes and points balance surface
- FAQ/about
- responsive media
- loading/error/reduced-motion states

Exit:

- complete phone journey works
- real location is always obvious
- arbitrary published activity records render correctly

## Phase 3: dynamic activity and points engine

Build:

- generic activity renderer
- activity completion/check-in contract
- point grant validation
- duplicate/repeat-rule enforcement
- authoritative point transaction ledger
- participant point total
- staff manual adjustment with audit trail
- point-disabled activity behavior

Exit:

- admin-created activity can award configured points without code changes
- changing point amount/rule does not require deployment
- visitor cannot self-author authoritative point transactions
- duplicate point awards are prevented according to configuration

## Phase 4: admin CMS and operations

Build:

- activity CRUD
- venue assignment
- activity publish/archive/order controls
- schedule editing
- registration/capacity editing
- points enable/disable/value/repeat rule editor
- activity completion verification tools
- participant lookup
- point adjustment/reversal
- prize content and points-required editing
- image upload/replace/crop/focal point
- Flow video upload/replace + poster association
- draft/publish controls
- mobile preview
- announcements/FAQ editor
- audit viewer

Exit:

- staff can create a brand-new activity, attach it to a venue, configure points, publish it, and operate it without developer involvement
- media lives in Firebase Storage
- no Supabase dependency exists

## Phase 5: registration, pass, QR, and redemption

Build the operational flows confirmed for the event:

- registration if required
- participant pass
- QR scanner/check-in
- activity QR/staff verification where appropriate
- prize redemption
- stock/claim limits
- point deduction or claim marking according to final reward policy

Exit:

- event-day flow is usable by participant and staff
- reward claim is verified against authoritative state
- operations are auditable

## Phase 6: Google Flow production and integration

Produce:

- one home hero Flow loop
- one scene for each real venue visual identity
- matching poster image for each

Integrate:

- lazy loading
- poster fallback
- reduced-motion fallback
- mobile compression
- non-blocking transitions
- real-location imagery/landmarks in or adjacent to immersive media

Exit:

- visual theme enhances recognition rather than replacing the venue identity
- no Flow asset blocks core interaction

## Phase 7: AI assistant

Build:

- Vercel server API
- approved Firebase knowledge snapshot
- global launcher
- venue/activity-aware suggested questions
- fallback to FAQ/search
- answers use real venue names
- optional analytics for unanswered questions

## Phase 8: event hardening

Test:

- iPhone Safari
- Android Chrome
- 360/390/430 px widths
- slow network
- video-disabled and failed-video states
- prefers-reduced-motion
- Firebase rules
- admin permission boundaries
- concurrent point/check-in attempts
- duplicate scans/completions
- prize claim race conditions
- AI timeout
- Vercel preview/production environments
- camera permissions

Add monitoring plus event-day rollback/content-freeze procedures.

## Phase 9: launch

- freeze core code
- keep admin content/activity/points edits available
- verify Firebase export/backups
- verify Vercel production deployment
- confirm activity records with event team
- confirm prize mechanics and stock
- train staff on activity creation, points configuration, verification, reversal, and redemption
- verify assistant knowledge matches final published content

## Priority rule

The operational data model comes before decorative media. A new activity must be launchable from Admin without code changes. Google Flow and generated art enhance the experience after the real-location, activity, and point infrastructure is reliable.
