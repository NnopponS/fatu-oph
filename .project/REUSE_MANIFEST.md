# Legacy Reuse Manifest

Source repository: NnopponS/fatu-oph

Branch policy:

- main is the preserved 2025 legacy.
- 2026 is the new implementation branch.
- old runtime code is not active on 2026.
- selected files are retained under references/legacy strictly to study proven workflows and rewrite them for the new architecture.

## Reference patterns worth reusing

- src/components/QRScannerModal.tsx
  - camera/QR interaction pattern
  - rewrite UI and validation before production use
- src/components/AdminLocationManager.tsx
  - editable location/admin workflow ideas
  - remove Supabase-specific media behavior
- src/components/AdminSubEventManager.tsx
  - useful precursor to dynamic Activities CRUD
  - replace sub-event schema with the new generic activity schema
- src/components/AdminParticipantManager.tsx
  - participant lookup/operations ideas
- src/contexts/AuthContext.tsx
  - route/session UX ideas only
  - replace legacy auth implementation with Firebase Authentication
- src/lib/crypto.ts
  - QR/check-in signing concepts
  - secrets must move server-side
- src/pages/Checkin.tsx
  - scan-to-completion flow reference
- src/services/excelExport.ts
  - event-day export/reporting patterns
- src/integrations/firebase/database.ts
  - Realtime Database adapter ideas
- src/services/firebase.ts
  - domain naming and data workflow ideas
  - must be rewritten rather than restored wholesale
- src/services/gemini.ts
  - assistant/context ideas
  - model credentials must remain server-side
- src/components/AdminHeroCardManager.tsx and HeroCardsTabContent.tsx
  - editable/reorderable content patterns
- legacy package.json, vercel.json and vite.config.ts
  - dependency/deployment history only

## Explicitly do not reuse in active 2026 code

- old .env values
- Supabase client, storage, functions or migrations
- Lovable metadata, lovable-tagger or Lovable-hosted assets
- pirate visual components, styles, logos, fonts and animation language
- old password-hash/session implementation
- public client check-in secrets
- one giant AdminDashboard architecture
- hard-coded 2025 location/activity records as production truth
- old prize/spin rules without revalidation
- emoji-based icon fields

## Security note

The historical repository previously tracked an .env file. Removing it from branch 2026 does not erase it from Git history. Treat any credentials ever committed to the old repository as exposed and rotate them before reusing associated services.
