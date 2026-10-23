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

## October 30 event plan and premium interface

The supplied four-page TU Open House plan is included at
`public/documents/open-house-plan-2026.pdf`. Dates use **2026-10-30 in Asia/Bangkok**
(30 ตุลาคม 2569). The imported content includes 32 workshop sessions, five stage
performances, one recreation activity and 14 registration/break/lunch/cleanup slots.
Room names and each round's time are retained. Theater Design has only three rounds;
ArtSa has five rounds, including 11:15–12:15. Registration is 07:00–09:00 at all
three activity venues. The faculty building remains a destination, with no invented
scheduled activities.

The application runs without Firebase credentials for **read-only browsing** using
`src/data/open-house-plan.json`. Run `npm ci && npm run dev`, then visit
`http://localhost:5173`. Login, registration, password reset and database writes
require a configured Firebase project. Preview does not fabricate accounts, points,
bookings or prize stock. Preview data never overrides a configured database.

The interface uses Apple's native system font on Apple devices, followed by Thai
and system fallbacks on other platforms. No Apple font binaries are redistributed.
Saved activities stay in the browser and are accessible through the saved filter.
The hero, planner and venue discovery support mobile and desktop.

### Import into an existing event database

1. Configure the Firebase browser variables from `.env.example`; configure the
   existing Vercel API's Firebase Admin variables for member/check-in operations.
2. Sign in as an existing Admin or Editor at `/admin/login` and open
   **แผนงาน / เจ้าหน้าที่** (`/admin/plan`).
3. Inspect the source PDF, staffing totals and import explanation. Click
   **ตรวจสอบข้อมูลก่อนนำเข้า**, review the record counts, then **ยืนยันนำเข้าแผน**.
4. Default import only inserts missing records with stable `oph26-` activity/slot
   IDs. It updates the site's date/location labels, keeps all other site settings,
   and leaves accounts, check-ins, prizes, stock, points and custom content intact.
   Repeating the default import does not duplicate records. Optionally refresh
   source-owned titles, rooms and times while retaining operational settings.
5. Review participation/price/capacity and points under **กิจกรรม** before opening
   bookings or granting points. The PDF specifies none of these, so imported
   activities start with `coming-soon`, unknown fees/capacity, and points disabled.
   The PDF's on-site registration window is separate from website member signup.

Do **not** replace an existing `/public` tree with `firebase/seed/public.json`:
that file also contains the repository's baseline prize/settings data. Use the
scoped importer to preserve the existing event configuration. The importer uses
an atomic public-path update under the existing database role rules; the existing
API records a content audit separately and reports if that audit fails.

Staffing is preserved exactly: 142 people in declared venue totals, but 143 when
summing all departments. The weaving venue says 30 while departments sum to 31.
The staff plan visibly flags this discrepancy for organizer review.

### Verification

- `npm run check`: frontend build, API TypeScript, ESLint.
- `npm run test:event-plan`: PDF session/time/room consistency, staffing totals,
  idempotent scoped imports and operational-setting preservation.
- With the app running without Firebase variables, `npm run test:event-plan-ui`:
  Chromium route/layout checks at 360/390/768/1440 px, search/filter/save/reload,
  PDF, protected admin route and unavailable-member feedback.
  Set `CHROME_PATH` if Chromium lives somewhere other than `/usr/bin/chromium`.
- `npm run test:api-routing`: isolated development/preview proxy regression.

This change does not deploy the application or write to the live Firebase project.
