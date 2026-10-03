# FATU Open House Rebuild — Durable Implementation Plan

## 1. System Audit & Current Failures Identified

### 1.1 Architecture Prior to Rebuild
- **Visitor Core:** Single-page application in React + Vite + React Router deployed to Vercel, backed by Firebase Realtime Database and Firebase Auth.
- **Old Participant Model:** Relied on a browser-generated opaque "pass token" stored in `localStorage`. There was no genuine user account, no password, and no username registration.
- **Old QR / Check-in Model:** Inverted workflow where staff scanned participant pass QR codes, or participant manually typed raw activity codes.
- **Old Staff / Admin Model:** Only a single `/admin/login` page existed with direct email/password. There was no dedicated `/staff/login`, no `/staff/register`, and no approval gating (`staff_pending`).
- **Old Admin CMS:** Limited to editing basic activities, venues, prizes, and FAQs. The landing hero, branding, registration fields, checkpoints, and theme settings were hard-coded.
- **Old Visuals:** Generic dark theme with modern neon accents, not honoring the rich mobile-first Chinese mythology art direction specified in `references/ui`.

### 1.2 Target Architecture
1. **Participant Authentication:**
   - Sign up with `username` + `password` + profile fields (name, school, grade, academic track, phone, email, consent).
   - Sign in with `username` + `password`.
   - Email is strictly a contact / recovery / announcement channel, never the visible login credential.
   - Normalized username unique index: `operations/usernames/{normalizedUsername} -> { uid, role: "participant" }`.
   - Secure server-side credential verification generating Firebase custom tokens.
2. **Staff Authentication & Role System:**
   - Dedicated routes: `/staff/login`, `/staff/register`, `/staff/pending`, `/staff/dashboard`.
   - Separate from participant login.
   - Staff registration creates an account with status `staff_pending`.
   - Strict admin approval required before any operational privileges are granted.
   - Roles: `participant`, `staff_pending`, `staff`, `editor`, `viewer`, `admin`. `super_admin` is intentionally not part of the current implementation.
3. **Self QR Check-in System:**
   - Participant opens their own phone to `/scan`.
   - Viewfinder with Chinese mythology ornamental frame scans the QR displayed at the activity / location.
   - Server-authoritative atomic check-in:
     - Awards activity completion & points (idempotent, prevents duplicate grants).
     - Automatically marks the parent location visited (`operations/locationVisits`).
4. **Customizable Back Office (CMS):**
   - Admin can customize Home hero (title, subtitle, CTA, announcement, hero asset), Locations (real name, mythology realm, description, map details, order, active), Activities, Checkpoints (QR generation/rotation), Registration form options (study tracks, grades, schools), Rewards, Theme/Branding, Announcements, Staff applications/roles, and Audit logs.
5. **Mobile-First Chinese Mythology Design System:**
   - Semantic tokens: `--color-jade-950`, `--color-jade-900`, `--color-gold-500`, `--color-red-800`, `--color-ivory-50`, etc.
   - Reusable primitives matching `references/ui` (PageShell, ChineseCard, ChineseButton, GoldDivider, CloudDivider, QRScannerFrame, etc.).
6. **PinePaper Animated Vector Assets:**
   - Installed & verified PinePaper Studio MCP server.
   - Original vector illustrations & animated SVGs for 4 Mythology Identities (Azure Dragon, White Tiger, Nine-Tailed Fox, Red Phoenix) and ornaments (clouds, seals, dividers, loading spinner, check-in stamp, chest).
7. **Animation System:**
   - Level A: Opening session animation (~1.5s, sessionStorage gated, reduced-motion compliant).
   - Level B: Themed loading states (rotating seal, dragon sweep).
   - Level C: UI micro-interactions (stamps, transitions, feedback).

---

## 2. Routes Specification

### Public / Visitor & Participant Routes
- `/` or `/home`: Visitor landing / Participant Hub (reflects login state)
- `/register`: Participant Registration (Username + Password + Study Track + Contact Email)
- `/login`: Participant Login (Username + Password)
- `/forgot-password`: Account recovery via username or email
- `/journey` / `/map`: Real location map & 4 Mythology Realms
- `/venue/:id`: Realm & physical venue details (โรงละคร, ตึกคณะ, โรงทอ, ตึก SC3)
- `/activity/:id`: Activity details
- `/scan`: Self QR Scanner for checkpoints
- `/rewards`: Rewards catalog & redemption progress
- `/profile`: Participant Journey Passport, stamps, and account settings
- `/schedule`: Event timeline
- `/faq`: Information & FAQ

### Staff Routes
- `/staff/login`: Staff username/password login
- `/staff/register`: Staff application registration
- `/staff/pending`: Status page for pending staff applications
- `/staff/dashboard`: Operational dashboard for approved staff

### Admin Back-Office Routes
- `/admin/login`: Admin login
- `/admin`: Dashboard with real-time KPIs, charts, and quick actions
- `/admin/participants`: Participant roster, points ledger, manual adjustments, reward redemptions
- `/admin/staff`: Staff application approval/rejection, role assignment, active/disabled status
- `/admin/locations`: Realm & physical venue CMS
- `/admin/activities`: Dynamic activity CMS & point rules
- `/admin/checkpoints`: QR checkpoint generator, rotation & print previews
- `/admin/rewards`: Reward catalog, stock tracking, and claim limits
- `/admin/registration`: Customizer for academic tracks, schools, grades, and consent
- `/admin/announcements`: Announcements & banner manager
- `/admin/theme`: Theme customizer (hero graphic, banners, enabled sections)
- `/admin/audit`: Comprehensive audit log viewer
- `/admin/settings`: System settings & data export (CSV)

---

## 3. Data Model (Firebase Realtime Database)

```json
{
  "public": {
    "site": {
      "heroTitle": "ตะลุยแดนมังกร",
      "heroSubtitle": "OPEN HOUSE 2026",
      "heroDescription": "ค้นพบ เรียนรู้ เติบโต ไปด้วยกันที่ OPH",
      "heroCtaText": "เริ่มต้นการเดินทาง",
      "heroSecondaryCtaText": "เข้าสู่ระบบ",
      "activeAnnouncement": "ยินดีต้อนรับสู่งาน Open House 2026!",
      "theme": { ... }
    },
    "registrationConfig": {
      "academicTracks": [
        { "id": "sci-math", "label": "วิทย์–คณิต" },
        { "id": "arts-math", "label": "ศิลป์–คำนวณ" },
        { "id": "arts-lang", "label": "ศิลป์–ภาษา" },
        { "id": "vocational", "label": "อาชีวศึกษา" },
        { "id": "other", "label": "อื่น ๆ" }
      ],
      "grades": ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6", "ปวช./ปวส.", "บุคคลทั่วไป"],
      "consentText": "ฉันยอมรับ ข้อกำหนดและเงื่อนไข และ นโยบายความเป็นส่วนตัว ของ OPH"
    },
    "locations": {
      "$locationId": {
        "id": "theater",
        "name": "โรงละคร",
        "realmTitle": "สวรรค์แดนมังกรฟ้า",
        "mythology": "azure_dragon",
        "description": "ดินแดนแห่งปัญญาและความฝัน",
        "loreQuote": "ปัญญา นำทางจินตนาการ สู่พลังที่ไร้ขีดจำกัด",
        "mapInfo": "โซน A - ลานมังกรฟ้า อาคารศิลปกรรม",
        "order": 1,
        "isPublished": true
      }
    },
    "activities": {
      "$activityId": {
        "id": "act-dragon-01",
        "locationId": "theater",
        "title": "สแกน QR ตามมังกร",
        "description": "เช็กอินจุดกิจกรรม ณ โรงละครเพื่อรับตราประทับมังกร",
        "pointsAwarded": 20,
        "pointGrantMode": "once",
        "completionMethod": "qr",
        "isPublished": true,
        "isArchived": false
      }
    },
    "prizes": {
      "$prizeId": {
        "id": "prize-01",
        "name": "ตุ๊กตามังกรยักษ์",
        "pointsCost": 1800,
        "stock": 50,
        "claimedCount": 18,
        "rarity": "legendary",
        "isPublished": true
      }
    },
    "announcements": { ... },
    "faq": { ... }
  },
  "operations": {
    "usernames": {
      "$normalizedUsername": {
        "uid": "user_uid_123",
        "role": "participant",
        "createdAt": "2026-10-01T..."
      }
    },
    "participants": {
      "$uid": {
        "id": "$uid",
        "username": "dragon_rider",
        "firstName": "ณัฐภัทร",
        "lastName": "วีระยะกุล",
        "displayName": "ณัฐภัทร วีระยะกุล",
        "school": "โรงเรียนสาธิตวิทยา",
        "grade": "มัธยมศึกษาปีที่ 5",
        "academicTrack": "วิทย์–คณิต",
        "phone": "081-234-5678",
        "email": "student@example.com",
        "consent": true,
        "createdAt": "2026-10-01T...",
        "status": "active"
      }
    },
    "locationVisits": {
      "$uid": {
        "$locationId": {
          "visitedAt": "2026-10-01T...",
          "triggerActivityId": "act-dragon-01"
        }
      }
    },
    "accounting": {
      "participants": {
        "$uid": {
          "pointTotal": 1250,
          "grantCounts": { ... },
          "transactions": { ... },
          "claims": { ... }
        }
      }
    },
    "checkpoints": {
      "$checkpointId": {
        "id": "chk-theater-01",
        "activityId": "act-dragon-01",
        "locationId": "theater",
        "token": "secret_signature_or_token",
        "mode": "static",
        "status": "active",
        "createdAt": "..."
      }
    },
    "staffApplications": {
      "$uid": {
        "uid": "$uid",
        "username": "staff_jane",
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "phone": "089-999-8888",
        "status": "pending",
        "appliedAt": "..."
      }
    },
    "audit": { ... }
  },
  "admin": {
    "roles": {
      "$uid": {
        "role": "admin | editor | staff | staff_pending | viewer",
        "updatedAt": "...",
        "updatedBy": "..."
      }
    }
  }
}
```

---

## 4. Phase Execution Plan

### Phase A: Audit & Preservation (Current)
- [x] Inspect existing routes, files, Firebase config, rules, and APIs.
- [x] Inspect UI references in `references/ui`.
- [x] Test and verify PinePaper MCP installation with Puppeteer/Edge Chromium.
- [x] Create durable implementation plan & architecture documentation under `.project/`.

### Phase B: Data & Auth Foundation
- [ ] Implement `POST /api/auth/register` (Participant username/password registration with uniqueness & profile indexing).
- [ ] Implement `POST /api/auth/login` (Participant username/password verification returning custom Firebase token).
- [ ] Implement `POST /api/auth/reset-password` (Forgot password via username/email without user enumeration).
- [ ] Implement `POST /api/auth/staff-register` (Staff application with `staff_pending` role).
- [ ] Implement `POST /api/auth/staff-login` (Staff username/password login with role enforcement).
- [ ] Build client auth state management (`src/services/auth.ts`, `AuthContext.tsx`).
- [ ] Update `database.rules.json` to enforce access restrictions.

### Phase C: Event Domain & Content Model
- [ ] Structure 4 Mythology Realms & physical locations:
  - โรงละคร -> Azure Dragon (สวรรค์แดนมังกรฟ้า)
  - ตึกคณะ -> White Tiger (เมืองมนุษย์พยัคฆ์ขาว)
  - โรงทอ -> Nine-Tailed Fox (ป่าแดนจิ้งจอก 9 หาง)
  - ตึก SC3 -> Red Phoenix (ถ้ำหงส์แดง)
- [ ] Ensure dynamic activities, checkpoints, rewards, announcements, and registration options are loaded from Firebase Realtime Database.
- [ ] Seed canonical locations and activities if missing.

### Phase D: Self QR Check-in System
- [ ] Implement `POST /api/checkin/verify`:
  - Validates authenticated user token.
  - Verifies QR payload format `FATU26:CHK:<checkpointId>:<token>` or `FATU26:ACT:<activityId>:<token>`.
  - Atomically grants activity points and records `locationVisits/{uid}/{locationId}`.
  - Returns duplicate status idempotently.
- [ ] Build participant `/scan` UI matching Reference 7:
  - Chinese ornamental viewfinder with dragon emblem.
  - Camera access with permission error handling.
  - File upload fallback.
  - Success celebratory toast with point reveal.

### Phase E: Admin & Staff Back Office Rebuild
- [ ] Admin Dashboard matching Reference 8 (KPIs, trend chart, realm donut, recent activity feed).
- [ ] Participant Management matching Reference 9 (Roster, search, filters, details modal, point adjustments, reward claims).
- [ ] Staff Management (Application approvals/rejections, role promotions, status toggling).
- [ ] Realms & Activities CMS matching Reference 10 (Realm editing, activity CRUD, ordering, status toggles).
- [ ] Checkpoint & QR Manager (Generate, rotate, download printable QR codes).
- [ ] Rewards Catalog Manager (Stock, point costs, rarity, publish status).
- [ ] Site & Theme Customizer (Hero texts, CTA labels, announcements, registration options).
- [ ] Audit Log Viewer.
- [ ] Staff Operational Dashboard (`/staff/dashboard`).

### Phase F: PinePaper Visual Assets Generation
- [ ] Azure Dragon Hero & Realm Emblem.
- [ ] White Tiger Realm Emblem.
- [ ] Nine-Tailed Fox Realm Emblem.
- [ ] Red Phoenix Realm Emblem.
- [ ] Chinese Cloud & Mountain decorations.
- [ ] Gold Seal / OPH Emblem.
- [ ] QR Viewfinder Dragon Ornament.
- [ ] Loading Animated Seal.
- [ ] Reward Chest & Stamp Icons.
- [ ] Store optimized assets in `src/assets/mythology/` and `src/assets/decorations/`.

### Phase G: Participant UI Rebuild
- [ ] Design System tokens in `src/styles/theme.css` & `src/styles/global.css`.
- [ ] Reusable Chinese UI primitives (`ChineseCard`, `ChineseButton`, `GoldDivider`, etc.).
- [ ] Rebuilt Participant Registration & Login (`/register`, `/login`) matching Reference 1.
- [ ] Rebuilt Participant Home / Hub (`/`, `/home`) matching Reference 2 & Reference 3.
- [ ] Rebuilt Realm / Venue Detail (`/venue/:id`) matching Reference 4.
- [ ] Rebuilt Rewards Catalog (`/rewards`) matching Reference 5.
- [ ] Rebuilt Profile / Passport (`/profile`) matching Reference 6.
- [ ] Rebuilt Self QR Scanner (`/scan`) matching Reference 7.
- [ ] Mobile bottom navigation bar.

### Phase H: Animation & Polish
- [ ] Level A: Opening animation (sessionStorage-persisted, reduced-motion compliant).
- [ ] Level B: Chinese seal loading spinner & overlays.
- [ ] Level C: Micro-interactions (Framer Motion page transitions, stamp check-in animations, chest unlock).

### Phase I: Verification & Production Readiness
- [ ] Execute 40+ manual/automated tests from the Test Matrix.
- [ ] Security audit: ensure no sensitive keys client-side, role spoofing prevented.
- [ ] Build check: `npm run check` (Vite build + API TypeScript check + ESLint).
- [ ] Update documentation and mark `<!-- GOAL_COMPLETE -->`.

### Phase K: 2026-10-03 Stabilization & Mobile Simplification (Current)
- [x] Preserve Antigravity rebuild before changes (`7a34b21`).
- [x] Align Admin Settings UI payloads with server schemas and make registration close/open authoritative.
- [x] Normalize Staff application status and repair pending/approved routing plus staff profile reload behavior.
- [x] Require valid rotated tokens for protected activity QR codes; tokenless activity payloads must not bypass rotation.
- [x] Make direct venue check-in idempotent and return the real participant point total.
- [x] Require self-check-in bearer identities to be real participant accounts.
- [x] Apply the same per-venue point policy to Staff manual completion and self QR completion.
- [x] Ensure zero-point activities do not consume a venue point entitlement.
- [x] Close username registration races with an atomic username claim and rollback failed Auth users.
- [x] Replace assertion-free feature scripts with a real emulator-backed stabilization regression suite.
- [x] Remove Three.js/WebGL from the mobile critical path; use lightweight PinePaper/static media now and reserve Google Flow video for optional decorative scenes.
- [x] Consolidate runtime asset paths on `public/assets` and remove duplicate runtime copies.
- [x] Re-run build/typecheck/lint, API smoke, auth rebuild suite, targeted stabilization suite, and browser smoke before production deployment.

Phase K local verification is complete. Remaining launch gate: real Admin account click-through on production after deployment and replacement/removal of mock event data before the actual event.
