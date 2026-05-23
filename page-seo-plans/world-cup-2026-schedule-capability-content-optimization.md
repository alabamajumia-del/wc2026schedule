# /world-cup-2026-schedule/ Capability Content Optimization

Execution date: 2026-05-23

## 1. User Feedback

The following sections were too text-heavy and did not provide enough user-facing value:

```text
How to Use the World Cup 2026 Match Schedule
World Cup 2026 Schedule Dates and Locations
Kickoff Times and Time Zones
Schedule by Team and Host City
FIFA World Cup 2026 Schedule Group and Bracket Planning
Downloads, Sources and Update Notes
Ways to Navigate the Full Schedule
```

## 2. Optimization Decision

The H2 structure was kept because it supports the page's SEO and topic hierarchy, but the body content was changed from long explanatory paragraphs into capability modules.

The page now gives users:

- Action cards.
- Date and location metrics.
- Host-city shortcut matrix.
- Timezone workflow steps.
- Team View and City View capability comparison.
- Group-stage and knockout-path board.
- Download decision cards.
- Navigation route cards.

## 3. Implemented Changes

Files changed:

```text
scripts/generate-site.mjs
src/styles.css
```

Implementation notes:

- Added a schedule-only capability renderer.
- Replaced schedule page long-form sections with structured UI modules.
- Replaced the generic usage table with route cards for the schedule page.
- Kept the same H2 topics, but made each section task-focused.
- Added responsive styles for all new modules.
- Kept Team View and City View interaction intact.

## 4. Post-Optimization Metrics

```text
Build: passed
Generated pages: 77
Visible word count: 4308
Primary exact keyword occurrences: 22
Primary exact keyword density: 0.51%
Validated keyword pool occurrences: 43
Validated keyword pool density: 1.00%
H1 count: 1
H2 count: 12
FAQ count: 8
Schedule rows: 104
Capability cards: 3
Navigation route cards: 6
Old long-form section text removed: yes
Team View regression check: Brazil -> 1 card, 3 matches
City View regression check: Dallas -> 1 card, 9 matches
Frontend page errors during automated check: 0
```

## 5. Quality Assessment

The page is now closer to a usable schedule workspace instead of an article with a large table. The content still supports search intent, but the visible page gives users more ways to act:

- Search a specific match.
- Switch planning views.
- Compare dates and locations.
- Convert kickoff context by timezone.
- Choose Team View or City View.
- Understand group-stage versus bracket planning.
- Pick the right download format.
- Navigate to the right next planning page.

## 6. Remaining Follow-Up

Recommended next tasks:

- Add filtered export behavior for visible results.
- Add single-match detail pages only when page-specific structure is strong enough.
- Run full visual QA in the in-app browser when the connection is stable.
