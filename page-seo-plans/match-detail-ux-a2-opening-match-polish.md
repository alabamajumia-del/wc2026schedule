# Phase Match Detail UX A.2

Date: 2026-05-25
Status: Completed
Scope: `/world-cup-2026-match/1-mexico-vs-south-africa/`

## Goal

Turn Match 1 into a stronger opening-match page instead of leaving it with the same generic single-match experience as every other fixture.

## Page Role

The opening match has higher user intent than a normal group-stage fixture. Users are not only checking the kickoff time; they are also trying to understand the tournament start, host-nation context, Group A route, Mexico City venue and the next match path.

## Added Experience

Added a Match 1-only `Opening match hub` section below the top match center.

The module includes:

```text
Opening match guide
First kickoff badge
Why this opener matters
What to confirm first
Opening day route
Group A follow-up cards
Direct action links to team, group, city and next-match pages
```

## SEO Reference

```text
Core keyword: Mexico vs South Africa World Cup 2026 schedule
URL: /world-cup-2026-match/1-mexico-vs-south-africa/
Title: Mexico vs South Africa World Cup 2026 schedule
Description length: 132 characters
H1 count: 1
First H2: Mexico vs South Africa World Cup 2026 schedule opening match guide
Exact keyword density: 3.95%
```

## Interaction Value

```text
User can confirm kickoff and timezone in the match center.
User can understand why Match 1 matters before reading longer context.
User can jump to Mexico schedule, South Africa schedule, Group A, Mexico City and Match 2.
User can keep browsing the opening-day route without returning to the full schedule table.
```

## Validation

```text
npm run build: passed
Generated pages: 185
Match detail pages checked: 104
Pages outside SEO checks: 0
Keyword density range after update: 3.12%-4.07%
Opening match spotlight present on Match 1: yes
Opening match spotlight present on Match 2+: no
Match center card present: 104
Old generic match hero present: 0
Local HTTP check for Match 1: 200
Local HTTP check for Match 2: 200
```

## Browser Note

The in-app browser connection timed out twice during this pass. The local server and generated HTML checks both passed, so this page should be opened manually for visual review at:

```text
http://localhost:3000/world-cup-2026-match/1-mexico-vs-south-africa/
```

## Next Recommendation

Apply this deeper, page-specific treatment only to high-demand matches. Recommended next candidates are opening-day host matches, United States matches, knockout fixtures and the final.
