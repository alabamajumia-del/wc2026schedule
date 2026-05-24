# World Cup 2026 Standings Page SEO and Optimization Plan

## 1. Phase Hero A.1: Standings Hero Redesign

Date: 2026-05-24
Status: Completed

Reason:

```text
Groups page now sends users to Standings through group cards, qualification panels and hero links. The Standings page needed to stop using the default static hero and become a ranking-board experience.
```

Core keyword:

```text
world cup standings 2026
```

Long-tail keyword family:

```text
world cup 2026 standings
world cup group standings
fifa world cup 2026 table
world cup group table
world cup qualification table
```

Optimization completed:

- Replaced the default hero with a dedicated `hero-standings` visual treatment.
- Added a first-screen Group Table Preview tool.
- Added a group selector that updates the hero ranking preview.
- Added a primary action that jumps to the selected group table.
- Added 12 group standings cards in the page body.
- Added true anchors for Groups page links, such as `/world-cup-2026-standings/#group-c`.
- Added full standings columns: P, W, D, L, GF, GA, GD, Pts and Status.
- Used zeroed pre-tournament values without inventing live results.
- Added qualification labels: direct qualifying lane, cross-group watch and needs points.
- Replaced generic usage rows with standings-specific workflow guidance.

Validation:

```text
Build passed.
Generated pages: 185
Hero class: hero hero-standings
H1: World Cup 2026 Standings
H1 count: 1
Group cards: 12
Standings tables: 12
Group C hero preview works: true
Hero apply URL: /world-cup-2026-standings/#group-c
Hash load /world-cup-2026-standings/#group-j preserves Group J: true
Desktop page overflow: 0
Desktop standings table overflow: 0
Mobile page overflow: 0
Mobile standings table uses internal horizontal scroll: true
Visible word count: 1,833
Keyword-family hits: 57
Keyword-family density: 3.11%
Target density: 3%-5%
```

Screenshots saved:

```text
page-seo-plans/standings-hero-redesign-desktop.png
page-seo-plans/standings-hero-redesign-mobile.png
```

Next recommended optimization:

```text
Standings Phase B: table filtering polish, status explanation, and future live-result update model.
```

## 2. Navigation Visibility Fix

Date: 2026-05-24
Status: Completed

Issue:

```text
The Standings page existed at /world-cup-2026-standings/ but was not visible in the top navigation because the navigation only displayed the first eight pages.
```

Fix completed:

- Replaced the first-eight-pages navigation rule with an explicit primary navigation list.
- Added `Standings` to the main navigation.
- Added `Bracket` to the main navigation so the Groups -> Standings -> Bracket path is visible.
- Reordered primary nav around the user journey: Schedule, Dates, Groups, Standings, Bracket, Cities, PDF, Excel, TV, Tickets.

Validation:

```text
Desktop nav labels: Schedule, Dates, Groups, Standings, Bracket, Cities, PDF, Excel, TV, Tickets
Standings href: /world-cup-2026-standings/
Bracket href: /world-cup-2026-bracket/
Desktop topbar overflow: 0
Desktop page overflow: 0
Mobile page overflow: 0
```
