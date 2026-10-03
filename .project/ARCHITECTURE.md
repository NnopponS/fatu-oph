# Architecture Specification — FATU Open House Rebuild

## 1. System Overview

FATU Open House 2026 is a mobile-first Progressive Web Application with a premium Chinese mythology visual design and authoritative server-backed event infrastructure.

### Technology Stack
- **Frontend:** React 18, TypeScript 5, Vite 8, React Router 7, Framer Motion 12, Lucide React.
- **Styling:** Native modern CSS custom properties (design tokens), scoped component classes, no Tailwind dependency.
- **Backend & Database:** Firebase Authentication (identity provider) + Firebase Realtime Database (event state & operations) in `asia-southeast1`.
- **Serverless API:** Vercel Serverless Functions (`api/`) running Node 22 with Firebase Admin SDK 13.
- **Vector & Animated Art Generation:** PinePaper Studio MCP Server (`@pinepaper.studio/mcp-server`) with Puppeteer Edge Chromium engine.

---

## 2. Authentication & Authorization Architecture

### 2.1 Participant Authentication
- **User Identifier:** `username` (normalized lowercase internally, e.g., `user_dragon`).
- **Secret:** Password (verified server-side against Firebase Auth; minimum 6 chars).
- **Contact Channel:** `email` (stored in profile, used for account recovery and official communications, NOT used for visible participant login).
- **Registration Flow:**
  1. Client calls `POST /api/auth/register` with `{ username, password, firstName, lastName, school, grade, academicTrack, phone, email, consent }`.
  2. Server normalizes username (`^[a-z0-9_.-]{3,30}$`).
  3. Server checks index `operations/usernames/{normalizedUsername}`.
  4. Server creates Firebase Auth user with a deterministic synthetic email (e.g. `usr_<normalizedUsername>@auth.fatu-oph.local` or the contact email if verified) and password.
  5. Server writes index: `operations/usernames/{normalizedUsername} = { uid, role: "participant" }`.
  6. Server writes profile: `operations/participants/{uid}`.
  7. Server initializes accounting ledger: `operations/accounting/participants/{uid}`.
  8. Server issues a Firebase Custom Token (`adminAuth.createCustomToken(uid)`).
  9. Client completes authentication using `signInWithCustomToken(auth, customToken)`.
- **Login Flow:**
  1. Client calls `POST /api/auth/login` with `{ username, password }`.
  2. Server normalizes username and resolves `operations/usernames/{normalizedUsername}/uid`.
  3. Server verifies credentials via Firebase Auth REST API or Admin SDK.
  4. If valid, server generates and returns a custom token.
  5. Client signs into Firebase Auth.
  6. Generic error returned for any failure: `"ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"`.

### 2.2 Staff Authentication & Approval Gating
- **Routes:** `/staff/login`, `/staff/register`, `/staff/pending`, `/staff/dashboard`.
- **Registration Flow:**
  1. Client calls `POST /api/auth/staff-register` with `{ fullName, username, email, phone, password, department }`.
  2. Account is created in Firebase Auth.
  3. Role is set to `staff_pending` in `admin/roles/{uid}`.
  4. Application record is stored in `operations/staffApplications/{uid}`.
  5. User is redirected to `/staff/pending`.
- **Security Guard:**
  - `staff_pending` accounts CANNOT access `/admin` or operational APIs.
  - Role promotion happens ONLY through server API invoked by an authenticated `admin`.

---

## 3. Self QR Check-in Architecture

1. Participant navigates to `/scan` on their personal mobile device.
2. Camera stream renders inside the custom Chinese ornamental frame with center dragon emblem.
3. When QR is scanned, payload is parsed (format: `FATU26:CHK:<checkpointId>:<token>` or `FATU26:ACT:<activityId>:<token>`).
4. Client sends `POST /api/checkin/verify` with `Authorization: Bearer <idToken>` and `{ qrPayload }`.
5. Server verifies:
   - Valid participant session.
   - Activity is published, not archived, and within schedule.
   - Checkpoint token matches recorded secret.
6. Server transaction:
   - Atomically awards activity completion and configured points.
   - Idempotently marks associated location as visited (`operations/locationVisits/{uid}/{locationId}`).
7. Response returns:
   - `{ ok: true, activityTitle, locationName, pointsAdded, pointTotal, newlyVisitedLocation, duplicate }`.
8. UI displays celebratory stamp animation, points gained, and updated progress.

---

## 4. Back-Office CMS & Operational Control

The admin back-office provides complete dynamic management without requiring code redeployments:
1. **Site & Theme:** Customizable hero titles, taglines, CTA buttons, active announcements, and enabled sections.
2. **Locations:** Edit physical venue names, assigned Chinese mythology realm, lore quotes, map details, order, and visibility.
3. **Activities:** Manage dynamic activities, point values, completion modes (QR, manual, session), capacity, and schedules.
4. **Checkpoints:** Generate, rotate, and print QR codes tied to activities and venues.
5. **Registration Customizer:** Configurable academic tracks, grades, and consent terms.
6. **Rewards:** Manage reward catalog, stock inventory, and point requirements.
7. **Staff Management:** Review pending staff applications, approve/reject, promote roles, and deactivate accounts.
8. **Participant Operations:** Search participants, inspect check-in histories, adjust points with reason, and redeem rewards.
9. **Audit Trail:** Immutable audit logs for all administrative and operational actions.
