# /world-cup-2026-schedule/ Phase 1.6 Team and City Views

Execution date: 2026-05-23

Page:

```text
/world-cup-2026-schedule/
```

## 1. Purpose

Phase 1.6 turns the Schedule page view switcher into a complete interaction model. Before this pass, Team and City were visible but disabled. After this pass, both are real views generated from the same structured schedule table.

The goal is to support the page's schedule-and-locations, team schedule and venue-planning search intent with actual interaction, not only SEO copy.

## 2. Implemented Features

Team View:

```text
48 confirmed team cards
144 team-match entries
Team chip header with flag image, three-letter code and team name
Opponent chip for each listed match
Local kickoff time
Watch-time label
Host city and stadium
Team page link
```

City View:

```text
16 host city cards
104 city-match entries
City guide link
Venue/stadium summary
Match count and stage count
Team chips for each match
Local kickoff time
Watch-time label
```

Shared behavior:

```text
Uses the existing 104 schedule rows as the data source
Follows selected timezone
Follows local-date filter
Follows search, stage, group, city and team filters
Updates active filter chips and result count
Does not add static duplicate SEO content
```

## 3. Technical Notes

Implementation files:

```text
scripts/generate-site.mjs
src/styles.css
```

Important implementation choices:

- Team and City cards are generated client-side from schedule row data.
- No second schedule dataset was created.
- Date, Team and City views reuse the same match data attributes.
- Team filtering in Team View matches the team group, not merely any row where the team appears as an opponent.
- City filtering in City View matches the city group.
- Knockout placeholder teams are not converted into team cards because they are not confirmed teams.

## 4. Validation

Build and runtime checks:

```text
npm run build: passed
Generated pages: 77
dist/schedule.js syntax check: passed
Local HTTP status: 200
Schedule table rows: 104
Team View cards: 48
Team View match entries: 144
Team filter test: Brazil -> 1 team card, 3 visible team matches
City View cards: 16
City View match entries: 104
City filter test: Dallas -> 1 city card, 9 visible city matches
Frontend page errors during automated check: 0
```

## 5. SEO Quality Guardrails

This phase supports SEO indirectly through product quality:

- It makes `schedule by team`, `schedule and locations` and `schedule with venue` intent useful on the page.
- It avoids hidden duplicated text.
- It avoids static repetition of the 104-match table.
- It keeps the main page as a tool-first schedule experience.

## 6. Remaining Follow-Up

Recommended next tasks:

- Add filtered export behavior so users can download the current filtered subset.
- Plan single-match detail pages with enough custom structure to avoid thin pages.
- Run visual QA screenshots in the in-app browser when that connection is stable.
- Consider local hosting for flag assets if production should avoid third-party asset dependency.
