# Schedule and PDF Pages Second-Pass Optimization Plan

Created: 2026-05-23

Pages:

```text
/world-cup-2026-schedule/
/world-cup-2026-schedule-pdf/
```

Purpose:

```text
Move both pages from "customized SEO pages" into stronger reusable tools. The goal is not more text. The goal is higher task completion, longer dwell time and repeat use.
```

Reference document:

```text
08-竞品参考优化方案.md
```

## 1. Current State Summary

### 1.1 Main Schedule Page

Current URL:

```text
http://localhost:3000/world-cup-2026-schedule/
```

Current status:

```text
Optimized first pass. Template-risk review completed. Hero visual improved. Schedule Phase A completed.
```

Current metrics:

```text
Words: 3607
FAQ items: 6
H1 count: 1
H2 count: 12
Schema blocks: 3
Exact primary keyword density: about 0.89%
Schedule rows: 104
Date-card view: generated on interaction from the table data
Generic template residue: none
Current visual module: mini schedule preview + filter strip
```

Current strengths:

- Strong full schedule table.
- Real filters for stage, group, date, city and team.
- Team and city links create useful internal paths.
- Good SEO coverage and FAQ coverage.
- Hero now signals a schedule tool, not a generic article.

Current limits:

- The main interaction now supports Table and Date cards, but Team and City views are not yet active.
- Mobile experience is improved for Date cards, while the table remains horizontally scrollable for dense scanning.
- The hero preview is visual only; it does not make the page feel fully interactive yet.
- No local time or timezone helper yet.
- No calendar reuse action.

### 1.2 PDF Page

Current URL:

```text
http://localhost:3000/world-cup-2026-schedule-pdf/
```

Current status:

```text
Optimized first pass. Template-risk review completed. Hero visual improved.
```

Current metrics:

```text
Words: 1653
FAQ items: 5
H1 count: 1
H2 count: 11
Schema blocks: 4
HowTo Schema: present
Exact primary keyword density: about 1.51%
Generic template residue: none
Current visual module: PDF sheet preview + download checklist
```

Current strengths:

- Clear PDF download intent.
- Distinct from the main schedule page.
- Explains PDF vs Excel vs live schedule.
- Has a PDF visual preview and download checklist.
- HowTo Schema is present.

Current limits:

- PDF preview is still illustrative, not based on actual generated file metadata.
- Download cards do not show file size, page count, generated date or included fields.
- The page does not yet offer team/city-specific PDF downloads.
- No calendar fallback or `.ics` companion CTA.
- No visible "last generated" file block near the download action.

## 2. Competitor Reference Mapping

| Page | Reference model | Competitor inspiration | Page tool type |
| --- | --- | --- | --- |
| `/world-cup-2026-schedule/` | MatchTimes + WorldCupHub | filters, date grouping, match cards | Schedule Tool |
| `/world-cup-2026-schedule-pdf/` | KickoffClock + Match Time Calendar | file format clarity, reuse action, calendar fallback | Download Tool |

Core principle:

```text
The schedule page should help users explore. The PDF page should help users take the schedule away and reuse it.
```

## 3. Second-Pass Strategy

### 3.1 Main Schedule Page Strategy

Target product feel:

```text
A searchable, switchable World Cup match workspace.
```

Primary user actions:

- Search a match.
- Filter by team.
- Filter by city.
- Filter by stage or group.
- Switch from table to date cards.
- Jump from a match to team/city pages.
- Export schedule after filtering.

Retention mechanism:

```text
Users return because the page is the fastest way to re-filter the tournament by team, city, date or stage.
```

Second-pass modules:

1. View switcher:

```text
Table View - completed in Schedule Phase A
Date View - completed in Schedule Phase A
Team View - planned next
City View - planned next
```

2. Date View:

```text
Group matches by date.
Each date section shows match cards.
Cards include match number, stage, group, teams, kickoff ET, city and stadium.
Completed in Schedule Phase A. Cards are built from existing table data after the user switches views, avoiding static HTML duplication.
```

3. Quick filter chips:

```text
Today / Opening match / Group stage / Knockout / Final week / Host cities
```

4. Sticky filter summary:

```text
Displays active filters and match count.
Offers Clear filters action.
```

5. Mobile match cards:

```text
On mobile, cards become primary and table becomes secondary.
```

6. Export CTA:

```text
Download full PDF
Open Excel planner
Future: export filtered CSV / ICS
```

### 3.2 PDF Page Strategy

Target product feel:

```text
A file download center for printable World Cup schedule planning.
```

Primary user actions:

- Download the PDF.
- Check what the PDF includes.
- Confirm when it was generated.
- Compare PDF with Excel and live schedule.
- Decide whether they need a team/city PDF later.

Retention mechanism:

```text
Users return to download a fresh copy before printing, ticket decisions, travel bookings or group sharing.
```

Second-pass modules:

1. File details block:

```text
File name
Format
Generated date
Match count
Included fields
Best use
Source status
```

2. Realistic PDF preview:

```text
Preview should resemble the actual generated PDF:
date group
match line
stage
city
stadium
```

3. Format comparison table:

```text
PDF: print/share/offline
Excel: filter/sort/custom notes
CSV: import/data tools
Live schedule: links and latest browsing
Calendar: future reminders
```

4. Download decision helper:

```text
If you want to print -> PDF
If you want to filter -> Excel
If you want reminders -> Calendar
If you want to browse -> Live schedule
```

5. Future downloads block:

```text
Team PDF downloads
City PDF downloads
Knockout PDF download
```

6. Calendar companion CTA:

```text
Coming next: add matches to Google, Apple or Outlook Calendar.
```

## 4. Detailed Implementation Plan

### Phase A: Schedule Page View Switcher

Files:

```text
src/content.mjs
scripts/generate-site.mjs
src/styles.css
```

Tasks:

- Add view tabs above the schedule tool.
- Add date-card markup generated from existing `matches`.
- Add JavaScript behavior to toggle table/date/team/city views.
- Keep filters working across the active view where possible.
- Add mobile styles so match cards are readable.

Acceptance:

- Table view remains available.
- Date view displays all 104 matches grouped by date.
- Mobile users can read cards without horizontal scrolling.
- No duplicated hidden SEO content; inactive views should be real UI, not keyword stuffing.

### Phase B: Schedule Page Filter UX

Files:

```text
scripts/generate-site.mjs
src/styles.css
```

Tasks:

- Add active filter summary.
- Add clear filters button.
- Add quick filter chips.
- Improve empty-state message when filters return no matches.

Acceptance:

- Users can see active filter state.
- Users can clear filters with one action.
- Match count updates clearly.
- Empty state suggests a useful next step.

### Phase C: PDF Page File Details

Files:

```text
src/content.mjs
scripts/generate-site.mjs
src/styles.css
```

Tasks:

- Add file details block near the download cards.
- Include generated date from schedule data.
- Include match count and included fields.
- Add source status and refresh guidance.
- Improve PDF preview to resemble actual file content.

Acceptance:

- User can identify what file they are downloading before clicking.
- PDF file information is visible before long article sections.
- The page no longer relies on generic file cards alone.

### Phase D: PDF Page Decision Helper

Files:

```text
src/content.mjs
scripts/generate-site.mjs
src/styles.css
```

Tasks:

- Add format comparison table.
- Add "Which file should I use?" decision helper.
- Add CTA to Excel and future Calendar page.

Acceptance:

- PDF page answers why PDF, why not Excel, and when to use live schedule.
- Excel and Calendar paths are clear.
- Copy remains natural and avoids keyword repetition.

## 5. SEO Safeguards

For both pages:

- Keep one H1.
- Keep Title under 70 characters.
- Keep Meta Description under 160 characters.
- Keep primary keyword density between 1%-2%.
- Keep keyword family density around 3%-5%.
- Do not add hidden keyword text.
- Do not duplicate large blocks between pages.
- Keep FAQ visible if marked in FAQPage Schema.
- Keep source and last updated notes visible.

## 6. UX Acceptance Checklist

Schedule page:

```text
[ ] User can tell this is a schedule tool within 3 seconds.
[ ] User can filter without reading the article.
[ ] User can switch to a mobile-friendly date/card view.
[ ] User can jump from a match to team/city pages.
[ ] User can export or download after finding the schedule they need.
```

PDF page:

```text
[ ] User can tell this is a PDF download page within 3 seconds.
[ ] User can see what the file includes before downloading.
[ ] User can compare PDF, Excel, CSV and live schedule.
[ ] User knows when to download a fresh copy.
[ ] User sees a future calendar path for reminders.
```

## 7. Recommended Execution Order

1. Schedule Phase A: view switcher + date cards.
2. Schedule Phase B: filter summary + clear filters.
3. PDF Phase C: file details + better preview.
4. PDF Phase D: decision helper + calendar companion CTA.

Reason:

```text
The schedule page is the traffic and internal-link hub. Improving its interaction first creates a stronger base for PDF, Excel, Calendar, Team and City pages.
```

## 8. What Not to Do

- Do not simply add more paragraphs.
- Do not reuse the PDF page hero for Excel.
- Do not add fake "live" behavior if data is static.
- Do not hide duplicated keyword text in inactive tabs.
- Do not treat mobile table scrolling as the final mobile experience.
- Do not create calendar claims before `.ics` files exist.
