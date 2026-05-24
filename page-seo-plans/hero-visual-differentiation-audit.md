# Hero Visual Differentiation Audit

Date: 2026-05-24
Scope: Main planning pages on wc26schedule
Status: Completed audit, implementation pending

## 1. Audit Goal

This audit checks whether each major page has a clear page-specific hero experience instead of repeating the same dark-green background, static quick-facts panel and generic navigation pattern.

The audit focuses on:

- Page-specific theme and visual identity.
- Whether the hero panel performs a useful task.
- Whether the page repeats the same layout as another page.
- Whether the next optimization should be visual, functional or both.

## 2. Pages Checked

Screenshots were captured for these pages:

```text
page-seo-plans/hero-audit/schedule-hero-desktop.png
page-seo-plans/hero-audit/pdf-hero-desktop.png
page-seo-plans/hero-audit/excel-hero-desktop.png
page-seo-plans/hero-audit/host-cities-hero-desktop.png
page-seo-plans/hero-audit/groups-hero-desktop.png
page-seo-plans/hero-audit/standings-hero-desktop.png
page-seo-plans/hero-audit/bracket-hero-desktop.png
page-seo-plans/hero-audit/dates-hero-desktop.png
page-seo-plans/hero-audit/tv-hero-desktop.png
page-seo-plans/hero-audit/tickets-hero-desktop.png
```

## 3. Findings by Page

| Page | Current hero | Panel value | Risk | Priority |
|---|---|---:|---|---:|
| `/world-cup-2026-schedule/` | `hero-schedule` stadium background | High | Functional, but still visually dark and control-heavy | Medium |
| `/world-cup-2026-schedule-pdf/` | `hero-pdf` trophy/PDF background | Medium | Page-specific, but tall and still dark-overlay dominant | Low-Medium |
| `/world-cup-2026-schedule-excel/` | `hero-excel` spreadsheet/stadium background | Medium | Good theme fit, but panel is mostly preview/download rather than tool | Low-Medium |
| `/world-cup-2026-schedule-host-cities/` | `hero-cities` map background | High | Useful, but visually too close to the old dark-green control panel pattern | High |
| `/world-cup-2026-schedule-groups/` | `hero-groups` blue/gold stadium background | High | Recently improved; needs only minor polish | Low |
| `/world-cup-2026-standings/` | `hero-default` | None | Static quick facts, same stock background as several pages | Critical |
| `/world-cup-2026-bracket/` | `hero-default` | None | Static quick facts, no bracket interaction or visual bracket signal | Critical |
| `/world-cup-2026-dates/` | `hero-default` | None | Static quick facts, no timeline/date planning experience | High |
| `/world-cup-2026-tv-schedule/` | `hero-default` | None | Static quick facts, no timezone/broadcast planning tool | High |
| `/world-cup-2026-tickets/` | `hero-default` | None | Static quick facts, no trust/ticket decision workflow | High |

## 4. Main Problems

### Problem A: Default Hero Still Dominates Secondary Pages

Standings, Bracket, Dates, TV and Tickets still use the same default hero:

```text
hero hero-default
Static Quick facts panel
Same dark-green stock-style football background
Generic buttons: Open schedule hub / Ticket guide
```

This creates the strongest template risk. These pages do not yet communicate their own use case in the first viewport.

### Problem B: Some Functional Panels Share the Same Shape

Schedule, Host Cities and Groups all use a control-panel pattern. Groups has been improved with a mode switch and page-specific visual treatment. Host Cities still feels closest to the older dark control panel format and should be redesigned next.

### Problem C: Quick Facts Panels Should Not Be the Default

If a page's hero panel only shows facts and no action, it does not increase user dwell time. A static facts panel should be replaced with a task-specific tool, visual preview or decision module.

### Problem D: Dark-Green Overlay Is Overused

Schedule, Host Cities and several default pages still lean heavily on dark-green treatment. The site needs a clearer visual system:

- Schedule: live match board / fixture command center.
- Host Cities: travel map / city cards / venue comparison.
- Groups: blue-gold group explorer.
- Standings: table/ranking board.
- Bracket: knockout route board.
- Dates: tournament timeline.
- TV: broadcast/timezone planner.
- Tickets: trust and decision guide.

## 5. Recommended Implementation Plan

### Phase Hero A: Replace Default Heroes

Priority pages:

```text
1. /world-cup-2026-standings/
2. /world-cup-2026-bracket/
3. /world-cup-2026-dates/
4. /world-cup-2026-tv-schedule/
5. /world-cup-2026-tickets/
```

Goal:

- Remove repeated `hero-default` from these pages.
- Give each page its own visual direction.
- Replace static Quick facts with a useful first-screen module.

### Phase Hero B: Host Cities Hero Redesign

Goal:

- Keep the useful city planner logic.
- Change the visual language so it no longer resembles the Groups/Schedule control panel.
- Make it feel like a city-map/travel planning hub.

Recommended direction:

```text
Left: concise city SEO copy and city comparison action.
Right: visual city route selector with map-like chips, region presets and direct city-card jump.
```

### Phase Hero C: Schedule Hero Simplification

Goal:

- Keep the control panel, but reduce visual heaviness.
- Make the next-match/live-board signal more prominent.
- Avoid making the control panel feel like a static admin widget.

### Phase Hero D: PDF and Excel Polish

Goal:

- PDF: reduce hero height and make the file chooser more visible above the fold.
- Excel: make the spreadsheet preview more obviously interactive or task-oriented.

## 6. Hero Quality Rules Going Forward

Use these checks before marking a hero as complete:

```text
1. The hero must communicate the page's unique purpose within five seconds.
2. The hero panel must do a real job: filter, preview, compare, download, route or decide.
3. No two adjacent main pages should share the same hero layout and color mood.
4. Static Quick facts are allowed only when paired with a useful action module.
5. The hero should have a page-specific visual metaphor: table, bracket, timeline, map, planner, download library or broadcast board.
6. Mobile hero must fit without horizontal overflow and without pushing all useful content too far below the fold.
```

## 7. Next Recommended Task

Execute:

```text
Phase Hero A.1: Standings hero redesign
```

Reason:

Groups now sends users to Standings through multiple links. The Standings page still has the weakest hero because it uses the default static template. It should become a ranking-board experience that previews group tables and qualification status.
