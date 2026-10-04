# Rewards and UX migration from 2025

Reference: [NnopponS/fatu-oph, branch 2025](https://github.com/NnopponS/fatu-oph/tree/2025), fetched at commit `5cc5a4b` on 4 October 2026. The reference was inspected as source; its unused constants do not override its executable reward flow.

## Rules carried into the current application

- The default threshold is **200 points**, one random draw per participant. The 2025 runtime setting `points_required_for_wheel` can override 200; the unused constants file's 300 is not the default used by the rewards screen.
- Drawing does **not** deduct points. There is no compulsory minimum number of venues or activities. Reaching all four venues is an optional passport achievement.
- The first scoreable activity at each venue awards **100 points by default**. Another activity at that same venue records completion but awards zero. Repeating an already completed activity awards zero. A zero-point activity does not consume the venue's activity entitlement.
- A first direct venue QR check-in awards **100 points** if the venue has not already been visited. An activity automatically records its venue visit. Therefore, activity first followed by venue QR awards no extra venue points. Venue QR first followed by that venue's first scoreable activity can award 200 in total; this intentionally preserves the old behavior.
- The survey gives **100 points once**, separately from the venue activity cap.
- Examples: first scoreable activities at two different venues; one scoreable activity plus the survey; direct check-ins at two venues; or a direct check-in followed by that venue's first scoreable activity. Each default example totals 200. The threshold is checked from the account balance, rather than a fixed count of completed tasks.

Historical source: `src/services/firebase.ts` (`checkinWithQRCode`, activity check-in and prize draw); `src/pages/Rewards.tsx` (runtime wheel setting and eligibility); `src/pages/Profile.tsx` (one survey bonus). The 2025 activity model allowed a custom positive `points_awarded` amount, with 100 as the default and zero as disabled.

## Current configuration and intentional changes

`public/site/rewardPolicy` is now the single configuration for `pointsPerVenue`, `surveyPoints`, `pointsRequired` and `pointExchangeEnabled`. Default values are 100 / 100 / 200 / false. The modern UI and APIs use the same normalization. Positive activity amounts are centrally standardized to `pointsPerVenue`; per-activity enable/disable and completion recording rules remain available. Historical earned balances are never rewritten by this change.

The current theme, real building photos, canonical names and map links, cinematic opening, guardian interactions, scroll scanner, reduced motion, skip controls and chest ceremony remain. There is no import of the old visual design or personal participant data.

The reward pool comes from published CMS prizes. `stock` is total configured stock; `drawWeight` is a relative random-draw weight, with zero excluding a prize; `rarity` controls its reveal presentation. Default weight 1 means equal relative weights; it is a fallback, not an organizer-approved odds table. A draw reserves stock and the participant's receipt in one transaction. Voucher indexes recover after an interrupted response, and a claimed voucher cannot be reset by recovery.

Direct venue QR codes now require a generated secret, like activity QR codes. In the portal, generate each venue's QR after deploying these API changes. Old tokenless venue QR codes are rejected rather than awarding unauthenticated venue points.

Staff first look up a participant or preview a Voucher, inspect the name and requested action, then explicitly confirm. Looking up or scanning in the staff workspace does not issue points or dispense a prize. Server role checks and transactions enforce the same boundaries.

Point exchange is an optional additional mode and defaults off. It does not replace the historical single random draw. When explicitly enabled, its separate redemption API is available; the public prize screen exposes the mode. The standard staff workflow is the draw Voucher.

## UX changes

- A visible score goal and remaining points on home, passport and rewards, with a next-action button and survey bonus link.
- A read-only refresh button for current points and entitlement after staff-assisted completion.
- A two-step registration form, deliberate education/type selection, general visitor support, back navigation that preserves entered data, and working information dialogs.
- Schedule search, saved activities, dates and time filters retained; added “live now”, “can still earn points”, always-available clear filters and complete spotlight dates. Earned venue badges no longer promise extra activity points.
- Survey status and submission match the server's POST contract and rating property names. Ratings begin unselected.
- FAQ and assistant reward answers use the current configured rules. Unverified placeholder telephone/email contacts were removed.

## Verification and release state

Automated checks run against disposable Firebase emulators or intercepted local browser fixtures. No real participant account, draw, reward redemption or CMS mutation was used for testing. Test coverage includes concurrent check-in, survey bonus, draw and last-item stock races, voucher preview/confirmation, role restrictions, interrupted-result recovery, registration and camera cleanup.

Verified: `npm run check`; `test:reward-policy` (five integration groups including assistant configuration); `test:stabilization` (nine groups); `test:experience` (41 cases, plus the changed reward refresh case rechecked); `test:browser` (15 routes); `test:api-routing` (dev and preview proxy contracts).

Production readiness still depends on deploying frontend and API together, reviewing the organizer's actual schedule and prize stock/weights in the portal, printing newly generated venue QR codes, and checking camera permissions/preview on real iOS and Android devices. These edits do not silently seed or change the live event database.
