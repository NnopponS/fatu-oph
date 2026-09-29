# UI and Experience Plan

## Confirmed creative direction

Theme: ตะลุยแดนมังกร (จีน)

The site uses four Chinese-myth visual identities tied to four real OPH locations:

1. โรงละคร -> Azure Dragon
2. ตึกคณะ -> White Tiger
3. โรงทอ -> Nine-Tailed Fox
4. ตึก SC3 -> Red Phoenix

The real location name is always the primary label. Creature/theme identity appears as supporting visual language only.

## Visual language

### โรงละคร / Azure Dragon

- sky, cloud sea, celestial-gate motifs, blue/teal dragon energy
- airy vertical compositions
- cool blue, jade, pale gold, cloud-white accents
- real theater facade/landmark imagery should remain recognizable

### ตึกคณะ / White Tiger

- structured architectural motifs, banners, White Tiger symbolism
- grounded composition
- ivory, charcoal, muted gold, controlled red accents
- real faculty-building imagery/landmarks should remain recognizable

### โรงทอ / Nine-Tailed Fox

- enchanted forest and textile-like organic motifs
- soft layered depth and elegant curves
- forest jade, dark teal, cream, restrained warm highlights
- real weaving-building imagery/landmarks should remain recognizable

### ตึก SC3 / Red Phoenix

- glowing cavern/fire-light motifs and Red Phoenix symbolism
- dramatic focal light with text-safe dark zones
- cinnabar red, ember orange, black, antique gold
- real SC3 imagery/landmarks should remain recognizable

Across the whole app:

- no emoji
- no embedded text inside generated artwork
- use SVG icons and authored motif assets
- typography remains contemporary and readable in Thai
- decorative motifs support, not replace, practical information

## Core mobile rules

- design 360-430 px first
- 16-20 px page side padding
- 8 px spacing system
- 16-20 px body text
- 44 px minimum touch targets
- one primary CTA per screen
- limit simultaneous animations
- page content remains usable before video finishes loading
- real venue name/directions remain visible regardless of media state

## Main visitor journey

### Opening / Home

Recommended structure:

1. short Google Flow opening/hero loop
2. FATU Open House title/date/location and primary CTA in HTML
3. "Explore locations" section using the four real venue names
4. featured/current activities loaded from Firebase
5. points/rewards preview
6. practical visitor information
7. AI assistant prompt
8. footer

### Explore

Use four large venue cards.

Each card includes:

- real venue name as the primary title
- supporting creature/theme identity
- real-location photo or recognizable landmark
- generated/Flow art as enhancement
- short description
- current published activity count
- view CTA

### Venue page

Each venue page may feel like entering its themed environment, but it must remain practical.

Use:

- real venue name first
- 2-4 second Flow transition or ambient loop where appropriate
- poster fallback
- real location photo/landmark
- directions/map link
- dynamic activity list from Firebase
- current status/schedule
- assistant quick question relating to that venue

Do not make the user wait through a mandatory animation.

### Activity detail

Generic activity detail structure:

1. cover image
2. activity name/status
3. venue
4. time/date
5. price/registration state if applicable
6. points awarded if enabled
7. completion/repeat condition if useful to visitors
8. description
9. preparation/requirements
10. CTA
11. related activities

All fields come from Firebase. No activity requires a custom page just because Admin created it.

### Points and prizes

Show:

- current point balance
- recently completed activities when useful
- published prize catalog
- point requirement/redemption rule when Admin has published it
- claim status/history where appropriate

Do not expose internal staff-only controls to visitors.

### Schedule

- date tabs
- venue filter
- vertical timeline/list
- optional "now / next" section

Avoid dense calendar grids on phones.

### Map

Use real venue names on all labels and tappable markers.

Theme creatures may decorate or animate markers, but the physical location name and recognizable venue context are the primary wayfinding information.

External directions can open the user's maps app.

### Assistant

Useful questions should use real locations, for example:

- โรงละครมีกิจกรรมอะไรบ้าง
- ตอนนี้กิจกรรมไหนกำลังเปิดอยู่
- ตึกคณะอยู่ตรงไหน
- กิจกรรมไหนได้แต้ม
- ตอนนี้ฉันมีแต้มเท่าไหร่
- ของรางวัลมีอะไรบ้าง
- SC3 ไปทางไหน

The assistant should never require visitors to know an internal visual-identity name.

## Admin UI

Admin is simpler and more functional than visitor UI.

Staff should be able to:

- create/edit/archive/publish activities
- assign the real venue
- edit schedules, capacity, registration, and content
- enable/disable points per activity
- set point value and completion/repeat rules
- verify activity completion
- look up participant point history
- adjust/reverse points with audit history
- manage prize requirements/stock/content
- upload/replace real and generated imagery
- upload/replace approved Flow videos and posters
- preview mobile presentation
- manage announcements/FAQ

## Reference images

The 10 supplied screenshots remain in references/ui.

During Phase 0, tag each screenshot for:

- navigation
- card density
- typography
- hero composition
- image treatment
- motion opportunity
- admin pattern

Use them as design references, not literal templates.
