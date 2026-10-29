# FATU-OPH 2026: production launch cleanup (29 October 2026)

The one-time launch preparation is implemented in `scripts/prepare-production-2026.mjs`.

## Scope

- Preserve `/public` content, existing venues, activities (including Theatre Design rounds 1-3), prizes, prize stock configuration, and existing QR secrets.
- Create or preserve `Workshop Theatre Design รอบที่ 4` in the theater with its own QR secret, and output a PNG locally. New content stays unpublished with no fabricated start/end time; an organizer must set the actual time and publish it in Admin.
- Back up the entire Realtime Database, QR secrets, and Firebase Auth account inventory in a private local directory before destructive operations.
- Delete all existing participant and non-admin Firebase Auth accounts, reset all `/operations` accounting/check-ins/prize claims/lucky draws/vouchers/prize runtime, and leave exactly the `admin-fatu2026` username with the `admin` role.
- Disable new staff self-registration through `public/settings/staffRegistrationOpen=false`. Existing API staff registration rejects when disabled.
- The supplied administrator password is **not** stored in GitHub. Inject it in `FATU_ADMIN_PASSWORD` at execution time.

## Execution

Run only from a trusted machine configured with the **production** Firebase Admin service credentials and access to the correct Firebase project. The script validates the production project ID and database URL. Install dependencies with `npm ci`.

First inspect the dry-run report:

```bash
node scripts/prepare-production-2026.mjs
```

If the report matches the expected live data, set the password and confirmation in the local environment (never in a committed .env or shell transcript). Then execute:

```bash
node scripts/prepare-production-2026.mjs --apply
```

Required environment values:
- `FATU_ADMIN_PASSWORD`: administrator password supplied by the organizer (do not put it in source control).
- `FATU_RESET_CONFIRM=RESET-FATU-OPH-2026`.
- `FIREBASE_ADMIN_PROJECT_ID=fatu-oph-2026`.
- Production service account credentials via ADC or `FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY`.
- Optional `FATU_BACKUP_DIR`: private backup location.

Backups contain personal information and secure tokens: encrypt them, restrict permissions, and delete them after the required retention period. The script writes a QR PNG into the backup directory. **Do not commit or publish that QR payload.**

## Go-live checklist

1. Confirm private backup exists and the script returned `outcome: READY`.
2. Confirm no visitor accounts remain and the only staff login is `admin-fatu2026`.
3. Confirm remaining stock equals the configured stock, with zero claims and zero lucky draw vouchers.
4. Confirm rounds 1-3 are intact. Fill the actual schedule for round 4, publish it, and verify scanning the new QR at the correct time.
5. Confirm staff self-registration returns 403 while visitor registration still works. Update or remove the public self-registration link separately if needed.

**Not automatic:** A GitHub commit alone does not run the migration or modify live Firebase state. Deployment of the API staff-registration guard and manual script execution are separate production operations.
