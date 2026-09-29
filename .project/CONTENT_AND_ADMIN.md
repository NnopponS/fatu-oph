# Firebase Content and Admin Architecture

## Source-of-truth rule

Anything likely to change close to the event must live in Firebase rather than source code.

This includes:

- real venue names and public directions
- visual identity/theme metadata
- activity title/description
- activity visibility and ordering
- point award rules
- completion/repeat rules
- price
- date/time
- registration link/state
- capacity/status
- images/video/posters
- CTA label/link
- FAQ
- announcements
- prize display and redemption configuration
- assistant knowledge

## Real venue records

Visitor-facing venue names are fixed to the real locations:

| id | Public name | Visual identity key |
| --- | --- | --- |
| theater | โรงละคร | azure-dragon |
| faculty-building | ตึกคณะ | white-tiger |
| weaving-building | โรงทอ | nine-tailed-fox |
| sc3 | ตึก SC3 | red-phoenix |

The visual identity key is presentation metadata only. Never display a fantasy realm name as a substitute for the physical location.

Venue records should support:

```text
id
name
shortLabel
description
directions
mapUrl
latitude
longitude
landmarkNotes
visualIdentityKey
coverMediaId
galleryMediaIds[]
displayOrder
isPublished
updatedAt
```

## Activities are fully dynamic

Production activities must not be hard-coded.

Admin can create, modify, publish, unpublish, archive, or delete activities without a new deployment.

Suggested activity record:

```text
id
slug
title
shortDescription
description
venueId
coverMediaId
galleryMediaIds[]
price
priceLabel
isFree
startAt
endAt
registrationMode
registrationUrl
capacity
availabilityStatus
ctaLabel
tags[]
displayOrder
isPublished
isArchived
pointsEnabled
pointsAwarded
pointGrantMode
repeatLimit
completionMethod
requiresStaffVerification
updatedAt
createdAt
```

Recommended `pointGrantMode` examples:

- once
- per-session
- repeat-limited
- manual-only

Do not encode these modes as separate source-code pages. They are configuration interpreted by the shared activity/points engine.

## Points ledger

Never calculate a participant's authoritative score only on the client.

Suggested operational records:

```text
/operations
  /participants
  /registrations
  /passes
  /checkins
  /activityCompletions
  /pointTransactions
  /prizeClaims
  /audit
```

Each point transaction should record at least:

```text
id
participantId
activityId
points
reason
source
staffId
completionId
createdAt
reversedAt
reversedBy
```

The displayed total should be derived from valid transactions or from a server-maintained aggregate with the ledger retained for auditability.

Important protections:

- participant must not be able to grant points to themselves
- duplicate completion must respect the activity repeat rule
- admin/staff adjustments create an audit record
- reversing points should create a traceable reversal rather than silently overwriting history
- prize redemption must verify the authoritative point balance

## Suggested Realtime Database shape

```text
/public
  /site
  /navigation
  /announcements
  /venues
  /activities
  /schedule
  /prizes
  /faq
  /assistantKnowledge
  /media
  /settings

/operations
  /participants
  /registrations
  /passes
  /checkins
  /activityCompletions
  /pointTransactions
  /pointTotals
  /prizeClaims
  /audit

/admin
  /roles
```

Public reads should be limited to published data under `/public`.

## Prize record

Suggested fields:

```text
id
name
tier
description
imageMediaId
stock
pointsRequired
redemptionRule
claimLimit
displayOrder
isPublished
updatedAt
```

Prize configuration is editable in admin. The currently known prize names can be seeded, while stock and redemption requirements may be added later.

## Media record

```text
id
provider
url
pathname
posterMediaId
altText
focalPointX
focalPointY
aspect
kind
source
venueId
visualIdentityKey
uploadedBy
createdAt
```

Recommended `kind` values:

- image
- video
- poster

Recommended `source` values:

- vercel-static
- vercel-blob
- generated-image
- google-flow

Keep crop/focal-point metadata so one master image can support mobile hero, cards, and desktop layouts.

## Firebase-authenticated administration

Use Firebase Authentication for staff/admin.

Roles:

- admin: full content, settings, permissions, point corrections, and high-impact operations
- editor: venues, activities, schedules, prize and media content
- staff: check-in, activity verification, point granting where permitted, prize redemption
- viewer: read-only dashboard if needed

Enforce permissions with Firebase Security Rules and server-side trusted operations where a client write would allow score manipulation.

## Admin workflow

1. Staff signs in with Firebase Auth.
2. Open Activities.
3. Create or select an activity.
4. Assign the real venue.
5. Edit content, schedule, registration, capacity, and media.
6. Enable points if the activity should award points.
7. Configure point amount and repeat/completion rule.
8. Preview phone layout.
9. Save draft.
10. Publish.
11. Public app receives the updated activity without deployment.

For event-day operation, staff can verify completion/check-in and the shared points engine records the corresponding transaction.

Add audit logging before event launch for publish/delete/point/prize/high-impact changes.

## Image/video editing scope

Staff should be able to:

- upload image
- replace image
- crop/reposition/focal point
- add alt text
- upload approved Google Flow video
- choose/update poster fallback
- assign media to venue/activity/banner/prize
- remove/disable media
- choose a pre-approved generated asset

Runtime generative AI is not needed inside the media editor for release one.
