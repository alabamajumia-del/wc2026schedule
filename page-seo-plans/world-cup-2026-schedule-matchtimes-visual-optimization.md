# /world-cup-2026-schedule/ Matchtimes Visual Optimization

Date: 2026-05-23

Reference:

```text
https://matchtimes.app/
```

## 1. Problem Found

The schedule page already had real data, timezone conversion, Team View and City View, but the match presentation was still too table-like.

Observed issues:

- Team and City cards squeezed team chips into narrow columns.
- Some team names wrapped vertically, making the page feel broken.
- The page lacked a strong "what should I look at first?" visual anchor.
- Countdown and next-match information existed, but it was presented as a small utility card instead of a central schedule feature.
- Match cards did not feel as reusable or scannable as the reference experience.

## 2. Reference Pattern Extracted

The reference page works well because it uses:

- A dark next-match spotlight panel.
- Large countdown digits.
- A short match title using "Team vs Team".
- A visible match-detail style action.
- A compact upcoming-match card rail.
- Flags, team codes, stage pill, local time, city and watch label in each match card.
- Strong contrast between the live planning area and the rest of the page.

## 3. Optimization Executed

Added a new schedule live board above the filters:

```text
Next match spotlight
Countdown: days / hours / minutes / seconds
Upcoming matches rail with 4 cards
Jump-to-match anchors
```

Improved match readability:

```text
Team and City aggregate match cards now use a wider two-column information flow.
Team chip text no longer breaks vertically.
City card match rows now keep matchup, local time, watch tag and stadium in a clearer scan path.
```

Improved flag rendering:

```text
Replaced fragile emoji-to-Twemoji flag URLs with explicit country/region flag codes.
Primary source: flagcdn.com SVG assets.
```

## 4. UX Impact

Users can now:

- See the next match immediately.
- Understand when it starts without reading the full table.
- Scan the next four matches visually.
- Jump from the visual card to the corresponding match row.
- Use Team View and City View without broken vertical text.
- Recognize teams faster through flag, three-letter code and name.

## 5. Files Changed

```text
scripts/generate-site.mjs
src/styles.css
```

Preview artifacts saved:

```text
page-seo-plans/schedule-live-board-flags-wait-preview.png
page-seo-plans/schedule-city-card-after-ux-preview.png
```

## 6. Validation

Automated checks:

```text
Build passed
Generated 77 pages
JavaScript syntax check passed
Live board count: 1
Upcoming match cards: 4
Next match title: Mexico vs South Africa
Countdown seconds field: active
Jump link: #match-1
Visible Team View cards after filtering Argentina: 1
Visible City View cards after filtering Atlanta: 1
Vertical team-name issues in Team View: 0
Vertical team-name issues in City View: 0
Frontend errors: 0
```

Flag check:

```text
Visible live-board flag URLs resolve to explicit country/region SVG paths such as mx.svg, za.svg, kr.svg, cz.svg, ca.svg, ba.svg, us.svg and py.svg.
```

## 7. Follow-Up Recommendation

Completed follow-up:

```text
Real single-match detail pages have been generated for all 104 schedule rows, and the schedule-page actions now point to Match details pages.
```

Next visual step:

```text
Improve the match detail page scoreboard so it feels closer to a match center while preserving page-specific SEO content and source notes.
```
