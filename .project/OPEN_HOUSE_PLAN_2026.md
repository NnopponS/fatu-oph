# October 30 plan import

Source: the supplied “แผนโครงการกิจกรรม Open House 2.pdf”, copied unchanged to
`public/documents/open-house-plan-2026.pdf` (four pages).

The source data is in `src/data/open-house-plan.json`, mirrored in the public seed.
The browser snapshot excludes baseline prize stock. Live connections always use
Realtime Database; local content is only a read-only fallback without Firebase
configuration. Apply the source using the scoped `/admin/plan` importer, never by
replacing an existing database root.

| Area | Workshop sessions | Performances | Recreation | Registration / breaks / lunch / cleanup |
| --- | ---: | ---: | ---: | ---: |
| โรงละคอน | 11 | 5 | 0 | 4 |
| โรงทอ | 16 | 0 | 1 | 5 |
| ArtSa / SC3 | 5 | 0 | 0 | 5 |
| Total | 32 | 5 | 1 | 14 |

Theater: Acting and crafts have four rounds; Theater Design has three. The fourth
theater round begins at 14:00, whereas the fourth weaving round starts at 14:15.
The ArtSa third round starts at 11:15; lunch starts there at 12:15. BlackBox has two
performances of สะพานรักสารสิน, 10:00 and 13:00. These overlaps are intentional.

The source does not confirm prices, capacity, activity points, or booking URLs.
Imported records have no points and unknown fees/capacity; workshop participation
is directed to on-site staff. Availability remains coming-soon until an organizer
sets it. No prize or staff user accounts are created from headcounts.

Staff totals: central 13, theater 79, weaving declared 30 (department sum 31), SC3 20.
Declared total 142; department sum 143. Preserve and display both figures.

Apple typography uses native `-apple-system` / `BlinkMacSystemFont`, with Thai
fallback fonts. Native Apple fonts are not bundled. The existing mythology and real
venue photography are retained. Navigation, hero, planner and shell are responsive;
nonblocking navigation replaces the automatic full-screen opening sequence.
