# World Cup 2026 Schedule Timezone and Watch Card Optimization

Page URL:

```text
/world-cup-2026-schedule/
```

Execution date:

```text
2026-05-23
```

## 1. Optimization Purpose

This pass moves the main schedule page closer to a real match-planning tool. The reference insight from MatchTimes is that users do not only need a fixture list; they need to know when each match happens in their own timezone and whether the kickoff is easy to watch.

Primary user tasks:

- Select a timezone.
- See local kickoff time in the full table.
- Switch to Date cards grouped by local date.
- Scan whether a match is Morning, Afternoon, Prime time, Late night or Overnight.
- See where future single-match detail pages will connect.

## 2. Implemented Interaction

Timezone planner:

```text
Added a timezone selector above the view switcher.
The selector defaults to the browser timezone when possible.
The selected timezone is saved in localStorage.
The table and Date cards update when the timezone changes.
```

Local time display:

```text
Each match row now includes a computed UTC kickoff value.
The visible table displays "Your Time" based on the selected timezone.
The original ET kickoff remains visible for source continuity.
```

Watch-time labels:

```text
06:00-11:59 Morning
12:00-16:59 Afternoon
17:00-21:59 Prime time
22:00-01:59 Late night
02:00-05:59 Overnight
```

Date cards:

```text
Date cards are generated from the existing 104 table rows after the user opens Date cards.
They are grouped by local date, not only by source ET date.
Cards show match number, stage, group, teams, local time, watch-time label, ET time, host city and stadium.
```

Single-match detail planning:

```text
Each match now has a stable planned detail URL in data-detail-url.
Example: /world-cup-2026-match/1-mexico-vs-south-africa/
The URL remains in data attributes for future page generation, but unfinished match-detail wording is not shown to users.
```

Usability refinement:

```text
The Date filter now uses local dates generated from the selected timezone.
The Date cards and Date filter therefore speak the same "local date" language.
The result bar shows how many matches are visible and which timezone/filter context is active.
Table headers now distinguish "Your Time" from "Source Time" and "Source Date".
```

Expression and rendering refinement:

```text
Added a watch-window legend so color labels have clear meaning.
Added active filter chips that can remove one filter at a time.
Added a clear-filters action near the schedule controls and in the empty state.
Added an empty state for no-result combinations.
Strengthened Date card hierarchy with match-number badges, stage pills and left/right team layout.
Kept the UI focused on user actions rather than editorial explanation.
```

Team and countdown refinement:

```text
Changed team names from plain text links into clickable team chips in the table and Date cards.
Added stable three-letter team code badges for all 48 teams in the current schedule data.
Added decorative flag images for real teams using Twemoji SVG assets.
Added a current-time display for the selected timezone.
Added a next-match countdown that updates once per minute.
Added a lightweight match status line to Date cards instead of second-by-second countdowns on every card.
The countdown uses the same UTC kickoff data as the timezone conversion.
```

## 3. Data Assumption

The schedule source gives kickoff time in ET. Since the tournament runs in June and July, ET is treated as EDT, or UTC-4, for the computed UTC value used by the timezone converter.

This should be rechecked if the official source changes kickoff-time notation or if future files provide direct UTC values.

## 4. SEO Quality Guardrails

- No hidden keyword block was added.
- Date cards are still generated interactively, avoiding static duplication of all 104 fixtures.
- The page keeps one H1 and the existing SEO section structure.
- The optimization improves task completion rather than increasing article text for keyword volume.
- The primary keyword remains naturally below overuse levels.

## 5. Validation

Latest validation:

```text
Build: passed
Generated pages: 77
Local URL: http://localhost:3000/world-cup-2026-schedule/
HTTP status: 200
H1 count: 1
H2 count: 12
Word count: 4308
Primary exact-match density: about 0.51%
Validated keyword pool density: about 1.00%
Table rows: 104
UTC kickoff fields: 104
Local time cells: 104
Planned detail URLs: 104
Static date cards in HTML: 0
Team chips: 208
Three-letter team codes: present
Flag images: 144 table instances, 48 unique flag assets
Flag image source: Twemoji SVG assets via jsDelivr
Timezone selector: present
Current selected-timezone clock: present
Next-match countdown: present
Watch-time logic: present
Local-date regrouping logic: present
Local-date filter: present
Active result context: present
Unfinished match-detail text in UI: not present
Watch-window legend: present
Active filter chips: present
Empty state: present
Clear filters action: present
Date-card match status: present
```

## 6. Remaining Work

Recommended next implementation steps:

- Build the 104 single-match detail pages only when there is enough custom structure to avoid thin template pages.
- Build stronger countdown components on future single-match detail pages.
- Add Team and City view modes in the view switcher.
- Add an export path for filtered results.
- Add browser visual QA once the browser automation connection is stable.
