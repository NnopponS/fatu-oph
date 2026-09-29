# Confirmed OPH Brief

Status: source of truth for the current planning stage.

## Theme

Theme: ตะลุยแดนมังกร (จีน)

The visitor experience should feel like travelling through a Chinese-myth-inspired world, but all visitor-facing place names must use the real event location names. Mythical creatures and Chinese-world concepts are visual identities only and must not replace, rename, or obscure the real location name.

## Confirmed real locations and visual identities

| Real location name shown to visitors | Visual identity |
| --- | --- |
| โรงละคร | Azure Dragon / มังกรฟ้า |
| ตึกคณะ | White Tiger / พยัคฆ์ขาว |
| โรงทอ | Nine-Tailed Fox / จิ้งจอกเก้าหาง |
| ตึก SC3 | Red Phoenix / หงส์แดง |

Rules:

- Navigation, map labels, activity cards, directions, search, assistant answers, QR/check-in screens, and admin venue fields use the real location name.
- Visual identity may control artwork, animation, decorative copy, icons, colors, backgrounds, and Google Flow scenes.
- Do not create an alternate fantasy place name that visitors must translate back into a real location.
- Real photos/video and recognizable landmarks should be mixed into location experiences so visitors can identify the physical place.

## Confirmed prizes

Current prize list:

- รางวัลใหญ่ตุ๊กตายักษ์
- รางวัลรองตุ๊กตาเล็ก
- ปิ่นปักผม
- พู่ห้อยทอสับ
- พัดมือ
- ซองแดง (ส่วนลดอาหาร)

Prize mechanics, quantities, odds, stock, point requirements, and redemption rules are admin-managed data and do not require source-code changes.

## Activities and points

Activities are dynamic operational content.

Admin must be able to:

- create, edit, publish, unpublish, archive, and reorder activities
- assign an activity to a real venue
- set description, image/video, schedule, capacity, registration state, and links
- enable or disable point collection per activity
- set the points awarded for completion
- define whether points can be earned once, per session, or according to a configured repeat rule
- change the activity or point value without a developer deployment
- temporarily disable point earning while keeping the activity visible
- view participant completion/point records and audit history

The public app must render activities from Firebase data rather than hard-coded activity definitions.

## Fixed technical decisions

- Deploy on Vercel.
- Firebase Authentication is used for staff/admin identity.
- Firebase Realtime Database is the application/event database.
- Fixed authored media is deployed from `public/media` with Vercel.
- Dynamic admin-managed images/video use Vercel Blob; Realtime Database stores only media URL/metadata.
- Do not use Supabase anywhere in the new application.
- Mobile web browser is the primary visitor experience.
- No emoji in the final UI.
- Staff/admin must be able to manage event information, venues, activities, point rules, prizes, schedules, links, and images without source-code changes.
- Keep an audience AI assistant.
- Google Flow is used for selected authored animation/video scenes in the visitor experience.
- Flow outputs are pre-rendered media assets with still-image fallbacks; Flow is not a runtime backend dependency.

## Current infrastructure state

Firebase is provisioned and verified:

- Firebase Web App configuration is wired
- Email/Password Authentication is enabled
- Realtime Database is live in Singapore
- production Security Rules are deployed from the repository
- the initial Admin role exists
- reproducible public seed data exists in `firebase/seed/public.json`

Remaining external setup:

- create/connect the Vercel project to `main`
- configure Firebase environment variables in Vercel
- create a public Vercel Blob store when dynamic Admin media upload is enabled

Implementation must consume environment configuration and must not hard-code secrets.
